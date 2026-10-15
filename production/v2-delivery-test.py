"""Validate both finished movies, including decoded audio and fast-start metadata."""
from pathlib import Path
import hashlib
import json
import re
import struct
import subprocess

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / 'qa/v2'
OUT = ROOT / 'out/v2'


def run(args: list[str], timeout: int = 120) -> subprocess.CompletedProcess:
    return subprocess.run(args, check=True, stdin=subprocess.DEVNULL,
                          capture_output=True, text=True, timeout=timeout)


def packet_hash(path: Path) -> str:
    return run(['ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:a:0',
                '-c:a', 'copy', '-f', 'hash', '-hash', 'sha256', '-']).stdout.strip()


def atom_order(path: Path) -> list[str]:
    atoms = []
    with path.open('rb') as handle:
        total = path.stat().st_size
        while handle.tell() + 8 <= total:
            start = handle.tell()
            size, kind = struct.unpack('>I4s', handle.read(8))
            if size == 1:
                size = struct.unpack('>Q', handle.read(8))[0]
            if size == 0:
                size = total - start
            if size < 8 or start + size > total:
                raise ValueError(f'Invalid MP4 atom at {start}: {path.name}')
            atoms.append(kind.decode('ascii'))
            handle.seek(start + size)
    return atoms


def main() -> None:
    source_hash = packet_hash(ROOT / 'public/audio/v2/master.m4a')
    results = []
    for kind, filename, width, height in [
        ('landscape', 'OfficeAdmin_AIVA_V2_Film.mp4', 1920, 1080),
        ('portrait', 'OfficeAdmin_AIVA_V2_Vertical.mp4', 1080, 1920),
    ]:
        movie = OUT / filename
        probe = json.loads(run(['ffprobe', '-v', 'error', '-show_streams',
                                '-show_format', '-of', 'json', str(movie)]).stdout)
        video = next(s for s in probe['streams'] if s['codec_type'] == 'video')
        audio = next(s for s in probe['streams'] if s['codec_type'] == 'audio')
        assert video['codec_name'] == 'h264' and video['pix_fmt'] == 'yuv420p'
        assert (video['width'], video['height']) == (width, height)
        assert video['avg_frame_rate'] == '30/1' and int(video['nb_frames']) == 2880
        assert all(video[k] == 'bt709' for k in ['color_space', 'color_primaries', 'color_transfer'])
        assert video['color_range'] == 'tv'
        assert audio['codec_name'] == 'aac' and audio['channels'] == 2
        assert int(audio['sample_rate']) == 48000
        assert abs(float(probe['format']['duration']) - 96.0) < 0.05
        assert abs(float(audio['duration']) - 96.0) < 0.05
        decoded = run(['ffmpeg', '-v', 'error', '-threads', '2', '-i', str(movie),
                       '-f', 'null', '-'])
        assert not decoded.stderr.strip(), decoded.stderr
        delivered_hash = packet_hash(movie)
        assert delivered_hash == source_hash, 'The exported movie has the wrong or altered soundtrack.'
        atoms = atom_order(movie)
        assert atoms.index('moov') < atoms.index('mdat'), 'Missing fast-start metadata.'
        measured = run(['ffmpeg', '-hide_banner', '-i', str(movie), '-vn',
                        '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json',
                        '-f', 'null', '-'])
        matches = re.findall(r'\{\s*"input_i".*?\}', measured.stderr, re.S)
        assert matches, 'Missing loudness measurement.'
        loudness = json.loads(matches[-1])
        assert -17.0 <= float(loudness['input_i']) <= -15.0
        assert float(loudness['input_tp']) <= -1.0, 'Insufficient encoded true-peak headroom.'
        with movie.open('rb') as handle:
            digest = hashlib.file_digest(handle, 'sha256').hexdigest()
        row = dict(kind=kind, filename=filename, passed=True, width=width, height=height,
                   frames=2880, fps=30, duration_seconds=96.0, full_decode_errors=0,
                   audio_packet_sha256=delivered_hash, audio_matches_master=True,
                   integrated_lufs=float(loudness['input_i']),
                   true_peak_dbtp=float(loudness['input_tp']), fast_start=True,
                   bytes=movie.stat().st_size, sha256=digest)
        results.append(row)
        print(json.dumps(row), flush=True)
    QA.mkdir(parents=True, exist_ok=True)
    (QA / 'final-delivery-validation.json').write_text(
        json.dumps({'passed': True, 'deliveries': results}, indent=2) + '\n')
    print('BOTH DELIVERIES PASSED', flush=True)


if __name__ == '__main__':
    main()
