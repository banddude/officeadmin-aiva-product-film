"""Mix and master the V4 narration, score, and character sound design."""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "audio" / "v4"
QA = ROOT / "qa" / "v4"
SR = 48_000
DURATION = 90.0


def stereo(audio: np.ndarray) -> np.ndarray:
    if audio.ndim == 1:
        return np.column_stack([audio, audio])
    if audio.shape[1] == 1:
        return np.repeat(audio, 2, axis=1)
    return audio[:, :2]


def load(name: str) -> np.ndarray:
    audio, rate = sf.read(OUT / name, dtype="float32", always_2d=False)
    if rate != SR:
        raise RuntimeError(f"Unexpected sample rate for {name}: {rate}")
    return stereo(audio)


def fit(audio: np.ndarray) -> np.ndarray:
    length = round(SR * DURATION)
    result = np.zeros((length, 2), dtype=np.float32)
    result[:min(length, len(audio))] = audio[:length]
    return result


def main() -> None:
    score = fit(load("score.wav"))
    voice = fit(load("narration.wav"))
    cues = json.loads((ROOT / "production" / "v4" / "narration.json").read_text())

    duck = np.ones(len(score), dtype=np.float32)
    for cue in cues:
        start = float(cue["start"])
        end = float(cue["end"])
        attack_start = max(0, round((start - 0.24) * SR))
        attack_end = round(start * SR)
        release_start = round(end * SR)
        release_end = min(len(duck), round((end + 0.46) * SR))
        if attack_end > attack_start:
            duck[attack_start:attack_end] = np.minimum(
                duck[attack_start:attack_end],
                np.linspace(1.0, 0.47, attack_end - attack_start, dtype=np.float32),
            )
        duck[attack_end:release_start] = np.minimum(duck[attack_end:release_start], 0.47)
        if release_end > release_start:
            duck[release_start:release_end] = np.minimum(
                duck[release_start:release_end],
                np.linspace(0.47, 1.0, release_end - release_start, dtype=np.float32),
            )

    premaster = score * duck[:, None] * 0.88 + voice * 0.98
    peak = float(np.max(np.abs(premaster)))
    if peak > 0.91:
        premaster *= 0.91 / peak
    sf.write(OUT / "premaster.wav", premaster, SR, subtype="PCM_24")

    measurement = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-nostats", "-i", str(OUT / "premaster.wav"),
            "-af", "loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json",
            "-f", "null", "-",
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    blocks = re.findall(r"\{\s*\"input_i\".*?\}", measurement.stderr, re.S)
    if not blocks:
        raise RuntimeError("Could not parse loudness measurement")
    measured = json.loads(blocks[-1])

    filter_value = (
        "loudnorm=I=-16:TP=-1.5:LRA=9:"
        f"measured_I={measured['input_i']}:"
        f"measured_TP={measured['input_tp']}:"
        f"measured_LRA={measured['input_lra']}:"
        f"measured_thresh={measured['input_thresh']}:"
        f"offset={measured['target_offset']}:linear=true:print_format=json"
    )
    mastered = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-y", "-i", str(OUT / "premaster.wav"),
            "-af", filter_value,
            "-ar", str(SR), "-c:a", "pcm_s24le", str(OUT / "master.wav"),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    final_blocks = re.findall(r"\{\s*\"input_i\".*?\}", mastered.stderr, re.S)
    final_measurement = json.loads(final_blocks[-1]) if final_blocks else {}

    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-y", "-i", str(OUT / "master.wav"),
            "-c:a", "aac", "-b:a", "320k", "-ar", str(SR),
            "-movflags", "+faststart", str(OUT / "master.m4a"),
        ],
        check=True,
    )

    probe = json.loads(
        subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(OUT / "master.m4a")],
            text=True,
        )
    )
    audio = probe["streams"][0]
    if audio["codec_name"] != "aac" or int(audio["sample_rate"]) != SR or int(audio["channels"]) != 2:
        raise RuntimeError("Finished soundtrack has the wrong format")
    if abs(float(probe["format"]["duration"]) - DURATION) > 0.05:
        raise RuntimeError("Finished soundtrack has the wrong duration")

    stats = {
        "duration": DURATION,
        "sampleRate": SR,
        "channels": 2,
        "narrationWords": sum(len(str(cue["text"]).split()) for cue in cues),
        "narrationSeconds": sum(float(cue["duration"]) for cue in cues),
        "premasterPeak": peak,
        "pass1": measured,
        "pass2": final_measurement,
        "codec": audio["codec_name"],
        "bitRate": audio.get("bit_rate"),
    }
    (QA / "mix-stats.json").write_text(json.dumps(stats, indent=2) + "\n")
    print(json.dumps(stats, indent=2), flush=True)
    print("V4 MIX COMPLETE", flush=True)


if __name__ == "__main__":
    main()
