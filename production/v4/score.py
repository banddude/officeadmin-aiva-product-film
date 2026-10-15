"""Compose the original V4 contractor story score and interface sound design."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "audio" / "v4"
QA = ROOT / "qa" / "v4"
OUT.mkdir(parents=True, exist_ok=True)
QA.mkdir(parents=True, exist_ok=True)

SR = 48_000
DURATION = 90.0
BPM = 126.0
BEAT = 60.0 / BPM
SEED = 261015
rng = np.random.default_rng(SEED)

mix = np.zeros((round(SR * DURATION), 2), dtype=np.float32)


def midi(note: float) -> float:
    return 440.0 * 2 ** ((note - 69.0) / 12.0)


def add(signal: np.ndarray, start: float, gain: float = 1.0, pan: float = 0.0) -> None:
    position = round(start * SR)
    if position >= len(mix) or position + len(signal) <= 0:
        return
    source_start = max(0, -position)
    destination_start = max(0, position)
    length = min(len(signal) - source_start, len(mix) - destination_start)
    if length <= 0:
        return
    value = signal[source_start:source_start + length] * gain
    mix[destination_start:destination_start + length, 0] += value * np.sqrt((1 - pan) / 2)
    mix[destination_start:destination_start + length, 1] += value * np.sqrt((1 + pan) / 2)


def noise(duration: float, high: bool = True) -> np.ndarray:
    length = round(duration * SR)
    raw = rng.normal(0, 1, length).astype(np.float32)
    kernel = np.ones(19, dtype=np.float32) / 19
    smooth = np.convolve(raw, kernel, mode="same")
    return (raw - smooth if high else smooth).astype(np.float32)


def oscillator(note: float, duration: float, kind: str = "pluck") -> np.ndarray:
    t = np.arange(round(duration * SR), dtype=np.float64) / SR
    frequency = midi(note)
    if kind == "pluck":
        phase = 2 * np.pi * frequency * t + 1.25 * np.sin(2 * np.pi * frequency * 2 * t) * np.exp(-t * 13)
        value = np.sin(phase) + 0.25 * np.sin(2 * np.pi * frequency * 2 * t) * np.exp(-t * 5)
        value += 0.08 * np.sin(2 * np.pi * frequency * 3 * t) * np.exp(-t * 9)
        envelope = (1 - np.exp(-t * 260)) * np.exp(-t * 5.5) * np.minimum(1, (duration - t) * 30)
    elif kind == "bass":
        value = np.sin(2 * np.pi * frequency * t) + 0.24 * np.sin(2 * np.pi * frequency * 2 * t)
        value += 0.07 * np.sin(2 * np.pi * frequency * 3 * t)
        envelope = (1 - np.exp(-t * 130)) * np.exp(-t * 2.3) * np.minimum(1, (duration - t) * 28)
    elif kind == "pad":
        value = np.sin(2 * np.pi * frequency * t)
        value += 0.22 * np.sin(2 * np.pi * frequency * 1.003 * t)
        value += 0.14 * np.sin(2 * np.pi * frequency * 2 * t)
        envelope = np.minimum(1, t / 0.38) * np.minimum(1, (duration - t) / 0.75)
    elif kind == "lead":
        value = np.sin(2 * np.pi * frequency * t + 0.16 * np.sin(2 * np.pi * 5.2 * t))
        value += 0.18 * np.sin(2 * np.pi * frequency * 2 * t)
        envelope = (1 - np.exp(-t * 95)) * np.exp(-t * 2.8) * np.minimum(1, (duration - t) * 24)
    else:
        raise ValueError(kind)
    return (value * envelope).astype(np.float32)


def kick() -> np.ndarray:
    duration = 0.42
    t = np.arange(round(duration * SR)) / SR
    phase = 2 * np.pi * (43 * t + 66 * 0.025 * (1 - np.exp(-t / 0.025)))
    body = np.sin(phase) * np.exp(-t * 12.5)
    transient = noise(duration) * 0.024 * np.exp(-t * 180)
    return ((body + transient) * np.minimum(1, t * 1000)).astype(np.float32)


def snare() -> np.ndarray:
    duration = 0.22
    t = np.arange(round(duration * SR)) / SR
    value = noise(duration) * np.exp(-t * 31) * 0.42
    value += np.sin(2 * np.pi * 183 * t) * np.exp(-t * 43) * 0.17
    clap = np.zeros_like(value)
    for offset in [0.0, 0.0075, 0.015]:
        gate = t >= offset
        clap += noise(duration) * 0.11 * np.exp(-np.maximum(0, t - offset) * 95) * gate
    value += clap
    return (value * np.minimum(1, t * 1100) * np.minimum(1, (duration - t) * 110)).astype(np.float32)


def hat(open_hat: bool = False) -> np.ndarray:
    duration = 0.24 if open_hat else 0.075
    t = np.arange(round(duration * SR)) / SR
    rate = 19 if open_hat else 72
    value = noise(duration) * np.exp(-t * rate) * (0.22 if open_hat else 0.18)
    return (value * np.minimum(1, t * 1500) * np.minimum(1, (duration - t) * 120)).astype(np.float32)


def click(pitch: float = 1500.0, duration: float = 0.055) -> np.ndarray:
    t = np.arange(round(duration * SR)) / SR
    return (np.sin(2 * np.pi * pitch * t) * np.exp(-t * 80) * np.minimum(1, t * 1800)).astype(np.float32)


def whoosh(duration: float = 0.62) -> np.ndarray:
    t = np.arange(round(duration * SR)) / SR
    envelope = np.sin(np.pi * np.minimum(1, t / duration)) ** 2
    sweep = noise(duration, high=False)
    high = noise(duration, high=True) * (t / duration)
    return ((sweep * 0.52 + high * 0.15) * envelope).astype(np.float32)


def glass_snap() -> np.ndarray:
    duration = 0.48
    t = np.arange(round(duration * SR)) / SR
    value = np.zeros_like(t)
    for frequency, offset, gain in [(1250, 0.0, 0.6), (2100, 0.008, 0.36), (3150, 0.017, 0.20)]:
        gate = t >= offset
        local = np.maximum(0, t - offset)
        value += np.sin(2 * np.pi * frequency * local) * np.exp(-local * 36) * gate * gain
    value += noise(duration) * np.exp(-t * 75) * 0.08
    return (value * np.minimum(1, t * 1800)).astype(np.float32)


def blink_chirp(base: float = 790.0) -> np.ndarray:
    duration = 0.15
    t = np.arange(round(duration * SR)) / SR
    phase = 2 * np.pi * (base * t + 950 * t * t)
    value = np.sin(phase) + 0.22 * np.sin(phase * 2)
    envelope = np.sin(np.pi * np.minimum(1, t / duration)) ** 1.7
    return (value * envelope).astype(np.float32)


KICK = kick()
SNARE = snare()
HAT = hat()
OPEN_HAT = hat(True)

CHORDS = [
    ([47, 54, 59, 62, 66], 35),  # B minor
    ([43, 50, 55, 59, 62], 31),  # G
    ([50, 57, 62, 66, 69], 38),  # D
    ([45, 52, 57, 61, 64], 33),  # A
    ([40, 47, 52, 55, 59], 28),  # E minor
    ([43, 50, 55, 59, 62], 31),
    ([50, 57, 62, 66, 69], 38),
    ([45, 52, 57, 61, 64], 33),
]


def energy_at(seconds: float) -> float:
    if seconds < 2.0:
        return 0.30
    if seconds < 7.0:
        return 0.72
    if seconds < 18.0:
        return 0.92
    if seconds < 31.0:
        return 1.02
    if seconds < 43.0:
        return 1.08
    if seconds < 55.0:
        return 1.15
    if seconds < 62.0:
        return 0.22
    if seconds < 77.0:
        return 0.73
    if seconds < 84.0:
        return 1.16
    return 0.76


bars = int(np.ceil(DURATION / (BEAT * 4)))
for bar in range(bars):
    start = bar * BEAT * 4
    notes, bass_note = CHORDS[bar % len(CHORDS)]
    energy = energy_at(start)

    for index, note in enumerate(notes):
        add(oscillator(note, BEAT * 5.4, "pad"), start, 0.018 * energy, -0.75 + index * 0.36)

    # A recognizable six-note motif returns with changing register.
    motif = [notes[2] + 12, notes[4] + 12, notes[3] + 12, notes[1] + 12, notes[4] + 12, notes[2] + 19]
    offsets = [0.0, 0.75, 1.5, 2.0, 2.75, 3.5]
    for index, (note, offset) in enumerate(zip(motif, offsets)):
        if 55 <= start < 62 and index not in [0, 4]:
            continue
        if start < 2 and index % 2:
            continue
        time = start + offset * BEAT
        add(oscillator(note, BEAT * 1.6, "pluck"), time, 0.060 * energy, -0.42 if index % 2 else 0.42)
        add(oscillator(note, BEAT * 1.5, "pluck"), time + BEAT * 0.19, 0.012 * energy, 0.72 if index % 2 else -0.72)

    # Syncopated bass locks to the contractor-work rhythm.
    if not (55 <= start < 62):
        for index, offset in enumerate([0.0, 0.75, 1.5, 2.5, 3.25]):
            note = bass_note + (12 if index == 3 and bar % 4 == 3 else 0)
            add(oscillator(note, BEAT * (0.72 if index != 4 else 0.48), "bass"), start + offset * BEAT, (0.10 + (index == 0) * 0.035) * energy)

    if start >= 2 and not (55 <= start < 62):
        kick_pattern = [0.0, 1.5, 2.0, 3.25] if bar % 2 == 0 else [0.0, 1.25, 2.0, 2.75, 3.5]
        for offset in kick_pattern:
            add(KICK, start + offset * BEAT, 0.23 * energy)
        for offset in [1.0, 3.0]:
            add(SNARE, start + offset * BEAT, 0.24 * energy, -0.08 if offset == 1 else 0.08)
        for step in range(16):
            offset = step * 0.25
            gain = 0.075 if step % 2 == 0 else 0.135
            if bar % 4 == 3 and step in [11, 13, 15]:
                gain *= 1.38
            add(HAT, start + offset * BEAT + (0.012 if step % 2 else 0), gain * energy, 0.46 if step % 2 else -0.38)
        if bar % 4 == 3:
            add(OPEN_HAT, start + 3.5 * BEAT, 0.11 * energy, -0.25)

# Scene transitions carry the story forward instead of stopping it.
for index, second in enumerate([7, 18, 31, 43, 55, 62, 77, 84]):
    add(whoosh(0.68), second - 0.43, 0.13 if second == 55 else 0.18, -0.22 if index % 2 else 0.22)
    add(click(1480 + index * 85, 0.06), second, 0.12, 0.16 if index % 2 else -0.16)

# The AIVA character moment: glasses arrive, sparkle, and blink twice.
add(glass_snap(), 57.03, 0.23)
add(oscillator(83, 0.75, "lead"), 57.56, 0.055, -0.25)
add(oscillator(90, 0.62, "lead"), 57.78, 0.042, 0.30)
add(blink_chirp(760), 58.40, 0.095, -0.18)
add(blink_chirp(830), 59.50, 0.088, 0.18)

# A softer repeat accompanies the character peeking over the closing mark.
add(blink_chirp(690), 86.24, 0.055, -0.10)
add(blink_chirp(740), 87.14, 0.052, 0.10)

# Resolve the final promise with an open chord and a short high motif.
for note, pan in zip([50, 57, 62, 66, 69, 74], [-0.8, -0.45, -0.1, 0.2, 0.5, 0.8]):
    add(oscillator(note, 6.0, "pad"), 84.0, 0.030, pan)
for offset, note in [(0.0, 74), (0.38, 78), (0.76, 81), (1.52, 86)]:
    add(oscillator(note, 2.2, "lead"), 84.4 + offset, 0.048, offset / 2.0 - 0.4)

# Gentle master fade only. Voice ducking occurs in mix.py.
time = np.arange(len(mix)) / SR
mix *= np.minimum(1, time / 0.40)[:, None]
mix *= np.minimum(1, (DURATION - time) / 1.25)[:, None]
peak = float(np.max(np.abs(mix)))
if peak > 0.92:
    mix *= 0.92 / peak

sf.write(OUT / "score.wav", mix, SR, subtype="PCM_24")
(QA / "score-stats.json").write_text(
    json.dumps(
        {
            "duration": DURATION,
            "sampleRate": SR,
            "tempo": BPM,
            "seed": SEED,
            "stereo": True,
            "music": "Original synthesis, no recorded samples",
            "glassesSnapSecond": 57.03,
            "blinkSeconds": [58.40, 59.50, 86.24, 87.14],
            "preMixPeak": peak,
        },
        indent=2,
    )
    + "\n"
)
print("V4 SCORE COMPLETE", flush=True)
