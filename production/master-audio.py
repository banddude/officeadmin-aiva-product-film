"""Two-pass web loudness mastering for an edited soundtrack. Requires FFmpeg."""
from pathlib import Path
import argparse, json, shutil, subprocess


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args()
    if shutil.which('ffmpeg') is None:
        parser.error('FFmpeg is required and was not found on PATH.')
    if not args.input.is_file():
        parser.error(f'Input does not exist: {args.input}')
    if args.input.resolve() == args.output.resolve():
        parser.error('Input and output must be different files.')
    if args.output.exists() and not args.overwrite:
        parser.error('Output exists. Choose another filename or explicitly use --overwrite.')
    analysis = subprocess.run([
        'ffmpeg', '-hide_banner', '-nostats', '-i', str(args.input),
        '-af', 'loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json',
        '-f', 'null', '-'
    ], capture_output=True, text=True, check=True)
    position = analysis.stderr.rfind('{')
    if position < 0:
        raise RuntimeError('FFmpeg did not return loudness measurements.')
    measurements, _ = json.JSONDecoder().raw_decode(analysis.stderr[position:])
    setting = (
        'loudnorm=I=-16:TP=-1.5:LRA=9'
        f":measured_I={measurements['input_i']}"
        f":measured_TP={measurements['input_tp']}"
        f":measured_LRA={measurements['input_lra']}"
        f":measured_thresh={measurements['input_thresh']}"
        f":offset={measurements['target_offset']}"
        ':linear=true:print_format=json'
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        'ffmpeg', '-hide_banner', '-nostats', '-y' if args.overwrite else '-n',
        '-i', str(args.input), '-af', setting, '-ar', '48000',
        '-ac', '2', '-c:a', 'pcm_s16le', str(args.output)
    ], check=True)
    print(f'Mastered soundtrack: {args.output}')


if __name__ == '__main__':
    main()
