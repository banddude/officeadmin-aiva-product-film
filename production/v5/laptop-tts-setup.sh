#!/bin/bash
# Laptop only: isolated TTS env for V5 narration (Kokoro ONNX v1.0, af/am preset voices, no cloning).
set -e
cd "$(cat /tmp/officeadmin-v5-workpath.txt)"
mkdir -p .tts/models
[ -x .tts/venv/bin/python ] || uv venv --python 3.12 .tts/venv
uv pip install --python .tts/venv/bin/python kokoro-onnx==0.4.9 soundfile numpy
cd .tts/models
[ -s kokoro-v1.0.onnx ] || curl -sSfL -o kokoro-v1.0.onnx.part https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx && mv -f kokoro-v1.0.onnx.part kokoro-v1.0.onnx 2>/dev/null || true
[ -s voices-v1.0.bin ] || curl -sSfL -o voices-v1.0.bin.part https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin && mv -f voices-v1.0.bin.part voices-v1.0.bin 2>/dev/null || true
ls -la; shasum -a 256 kokoro-v1.0.onnx voices-v1.0.bin
../venv/bin/python -c "import kokoro_onnx,onnxruntime;print('TTS READY',kokoro_onnx.__version__ if hasattr(kokoro_onnx,'__version__') else '',onnxruntime.__version__)"
