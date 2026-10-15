# Editing the sound

The final, mixed soundtrack is already included at `public/audio/master.wav`. Rendering the film does not require any voice models or Python packages. The individual narration cues, the narration stem, and the music-and-sound stem are also included.

## Adjust timing without regenerating a voice

The cue text, timing, and WAV filenames are in `production/narration.json`. Update those start times and the matching scene timing in `src/index.tsx`. The music and sound generator uses those cue timings for the narration mix and ducking.

## Regenerate narration and score

This is optional. Create a Python virtual environment and install `production/audio-requirements.txt`. Obtain `kokoro-v1.0.onnx` and `voices-v1.0.bin` from the Kokoro ONNX project's model-file release and place them in a local `.models` directory. Original voice model weights are provided as two separate download files on Release v1.0.0; save them into `.models/`. Review the upstream model and engine notices in `claims-and-provenance.md` before using or distributing them.

Edit the text and timing in `production/narration.py`, then run these commands from the project root with the virtual environment active:

```sh
python production/narration.py
python production/score.py
python production/master-audio.py public/audio/master-premaster.wav public/audio/master-revised.wav
```

Listen to the revised mix before replacing the supplied master. `master-audio.py` refuses to overwrite an existing file unless `--overwrite` is explicitly supplied. It performs two-pass loudness measurement and targets approximately -16 LUFS integrated with a -1.5 dBTP ceiling. The delivered WAV remains the authoritative original mix; editing the script, model, score, or mastering settings can change the regenerated result.

After replacing the master and updating timings, regenerate the captions with `python production/build-handoff.py`. Render the film again. The visual render script reuses completed video chunks, so changed visuals must be rendered into a fresh `out` directory or the old completed chunks must be archived first.

AIVA is spelled `Ava` in the synthesis script to obtain the intended pronunciation. Captions and the written script restore the product spelling `AIVA`.
