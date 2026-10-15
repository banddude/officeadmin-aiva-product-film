"""Validate both V4 films through full decode, metadata, soundtrack identity and loudness."""
from __future__ import annotations

import hashlib
import json
import re
import struct
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "out" / "v4"
QA = ROOT / "qa" / "v4"


def run(arguments: list[str], timeout: int = 240) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        arguments,
        check=True,
        stdin=subprocess.DEVNULL,
        capture_output=True,
        text=True,
        timeout=timeout,
    )


def audio_packet_hash(file: Path) -> str:
    return run([
        "ffmpeg", "-v", "error", "-i", str(file), "-map", "0:a:0",
        "-c:a", "copy", "-f", "hash", "-hash", "sha256", "-",
    ]).stdout.strip()


def atom_order(file: Path) -> list[str]:
    atoms: list[str] = []
    total = file.stat().st_size
    with file.open("rb") as stream:
        while stream.tell() + 8 <= total:
            start = stream.tell()
            size, kind = struct.unpack(">I4s", stream.read(8))
            if size == 1:
                size = struct.unpack(">Q", stream.read(8))[0]
            if size == 0:
                size = total - start
            if size < 8 or start + size > total:
                raise ValueError(f"Invalid MP4 atom at {start} in {file.name}")
            atoms.append(kind.decode("ascii"))
            stream.seek(start + size)
    return atoms


def sha256(file: Path) -> str:
    digest = hashlib.sha256()
    with file.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main() -> None:
    source_audio_hash = audio_packet_hash(ROOT / "public" / "audio" / "v4" / "master.m4a")
    results = []
    deliveries = [
        ("landscape", "OfficeAdmin_AIVA_V4_Contractor_Story_Film.mp4", 1920, 1080),
        ("portrait", "OfficeAdmin_AIVA_V4_Contractor_Story_Vertical.mp4", 1080, 1920),
    ]
    for kind, filename, width, height in deliveries:
        movie = OUT / filename
        probe = json.loads(run([
            "ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(movie),
        ]).stdout)
        video = next(stream for stream in probe["streams"] if stream["codec_type"] == "video")
        audio = next(stream for stream in probe["streams"] if stream["codec_type"] == "audio")
        assert video["codec_name"] == "h264" and video["pix_fmt"] == "yuv420p"
        assert (video["width"], video["height"]) == (width, height)
        assert video["avg_frame_rate"] == "30/1" and int(video["nb_frames"]) == 2700
        assert all(video[key] == "bt709" for key in ["color_space", "color_primaries", "color_transfer"])
        assert video["color_range"] == "tv"
        assert audio["codec_name"] == "aac" and int(audio["channels"]) == 2
        assert int(audio["sample_rate"]) == 48_000
        assert abs(float(probe["format"]["duration"]) - 90.0) < 0.05
        assert abs(float(audio["duration"]) - 90.0) < 0.05

        decoded = run(["ffmpeg", "-v", "error", "-threads", "2", "-i", str(movie), "-f", "null", "-"])
        assert not decoded.stderr.strip(), decoded.stderr
        delivered_audio_hash = audio_packet_hash(movie)
        assert delivered_audio_hash == source_audio_hash, "Delivered movie has the wrong soundtrack"
        atoms = atom_order(movie)
        assert atoms.index("moov") < atoms.index("mdat"), "Missing fast-start metadata"

        measured = run([
            "ffmpeg", "-hide_banner", "-nostats", "-i", str(movie), "-vn",
            "-af", "loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-",
        ])
        blocks = re.findall(r'\{\s*"input_i".*?\}', measured.stderr, re.S)
        assert blocks, "Missing loudness measurement"
        loudness = json.loads(blocks[-1])
        assert -16.8 <= float(loudness["input_i"]) <= -15.2
        assert float(loudness["input_tp"]) <= -1.0

        row = {
            "kind": kind,
            "filename": filename,
            "passed": True,
            "width": width,
            "height": height,
            "frames": 2700,
            "fps": 30,
            "durationSeconds": 90.0,
            "fullDecodeErrors": 0,
            "audioMatchesMaster": True,
            "audioPacketSha256": delivered_audio_hash,
            "integratedLufs": float(loudness["input_i"]),
            "truePeakDbtp": float(loudness["input_tp"]),
            "fastStart": True,
            "bytes": movie.stat().st_size,
            "sha256": sha256(movie),
        }
        results.append(row)
        print(json.dumps(row), flush=True)

    QA.mkdir(parents=True, exist_ok=True)
    (QA / "final-delivery-validation.json").write_text(
        json.dumps({"passed": True, "deliveries": results}, indent=2) + "\n"
    )
    print("BOTH V4 DELIVERIES PASSED", flush=True)


if __name__ == "__main__":
    main()
