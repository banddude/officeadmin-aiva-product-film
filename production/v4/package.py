"""Package V4 release assets and build final-video review sheets."""
from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "out" / "v4"
QA = ROOT / "qa" / "v4"
AUDIO = ROOT / "public" / "audio" / "v4"
OUT.mkdir(parents=True, exist_ok=True)
QA.mkdir(parents=True, exist_ok=True)


def sha256(file: Path) -> str:
    digest = hashlib.sha256()
    with file.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def audio_stems() -> None:
    target = OUT / "OfficeAdmin_AIVA_V4_Audio_Stems.zip"
    files = sorted(AUDIO.glob("*.wav"))
    files += [
        ROOT / "production" / "v4" / "narration.py",
        ROOT / "production" / "v4" / "score.py",
        ROOT / "production" / "v4" / "mix.py",
        ROOT / "production" / "v4" / "narration.json",
        ROOT / "production" / "v4" / "captions.srt",
        ROOT / "production" / "v4" / "captions.vtt",
        ROOT / "production" / "v4" / "production-notes.md",
        ROOT / "NOTICE.md",
    ]
    with zipfile.ZipFile(target, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=2) as archive:
        for file in files:
            if file.exists():
                archive.write(file, file.relative_to(ROOT))
    with zipfile.ZipFile(target) as archive:
        forbidden = (".woff", ".woff2", ".ttf", ".otf", ".onnx", ".bin")
        if any(name.endswith(forbidden) for name in archive.namelist()):
            raise RuntimeError("Audio archive contains a forbidden model or font binary")
    print("AUDIO STEMS", target, target.stat().st_size)


def still(movie: Path, seconds: float, output: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", f"{seconds:.3f}", "-i", str(movie), "-frames:v", "1", "-q:v", "2", str(output)],
        check=True,
    )


def review_sheet(kind: str, filename: str, cell: tuple[int, int]) -> None:
    movie = OUT / filename
    times = [2.0, 8.5, 14.5, 21.5, 28.5, 34.5, 41.5, 47.5, 53.5, 57.3, 59.5, 68.2, 74.3, 80.5, 86.5, 89.0]
    width, height = cell
    caption = 25
    sheet = Image.new("RGB", (width * 4, (height + caption) * 4), "#dfe3e6")
    draw = ImageDraw.Draw(sheet)
    manifest = []
    for index, seconds in enumerate(times):
        output = QA / f"delivery-{kind}-{round(seconds * 30):04}.jpg"
        still(movie, seconds, output)
        image = Image.open(output).convert("RGB")
        image.thumbnail((width, height))
        x = index % 4 * width
        y = index // 4 * (height + caption)
        sheet.paste(image, (x, y + caption))
        draw.text((x + 8, y + 6), f"{seconds:.1f}s", fill="#293039")
        manifest.append({"seconds": seconds, "frame": round(seconds * 30), "file": output.name, "sha256": sha256(output)})
    sheet_file = QA / f"OfficeAdmin_AIVA_V4_Review_{kind}.jpg"
    sheet.save(sheet_file, quality=94)
    poster_source = QA / f"delivery-{kind}-{round(89.0 * 30):04}.jpg"
    poster_name = "OfficeAdmin_AIVA_V4_Poster.jpg" if kind == "landscape" else "OfficeAdmin_AIVA_V4_Poster_Vertical.jpg"
    shutil.copy2(poster_source, QA / poster_name)
    (QA / f"delivery-{kind}-frames.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print("REVIEW SHEET", kind, sheet_file)


def release_files() -> None:
    shutil.copy2(ROOT / "production" / "v4" / "captions.srt", OUT / "OfficeAdmin_AIVA_V4.srt")
    shutil.copy2(ROOT / "production" / "v4" / "captions.vtt", OUT / "OfficeAdmin_AIVA_V4.vtt")
    assets = {}
    for file in sorted(OUT.iterdir()):
        if file.is_file() and file.suffix.lower() in {".mp4", ".zip", ".srt", ".vtt"}:
            assets[file.name] = {"bytes": file.stat().st_size, "sha256": sha256(file)}
    (OUT / "SHA256SUMS.txt").write_text("".join(f"{data['sha256']}  {name}\n" for name, data in assets.items()))
    (QA / "release-assets.json").write_text(json.dumps(assets, indent=2) + "\n")
    print(json.dumps(assets, indent=2))


def main() -> None:
    audio_stems()
    review_sheet("landscape", "OfficeAdmin_AIVA_V4_Contractor_Story_Film.mp4", (480, 270))
    review_sheet("portrait", "OfficeAdmin_AIVA_V4_Contractor_Story_Vertical.mp4", (270, 480))
    release_files()


if __name__ == "__main__":
    main()
