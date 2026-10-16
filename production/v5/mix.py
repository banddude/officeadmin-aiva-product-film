"""V5 mix + master: score ducked under narration/AIVA, sound design on top. Laptop only. -> master.wav/.m4a"""
from pathlib import Path
import json,subprocess
import numpy as np
import soundfile as sf
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/audio/v5';QA=ROOT/'qa/v5'
TL=json.loads((ROOT/'production/v5/timeline.json').read_text());SR=48000;N=round(SR*float(TL['duration']))
def load(n):
    a,r=sf.read(OUT/n,dtype='float32',always_2d=True);assert r==SR,(n,r)
    a=np.repeat(a,2,axis=1) if a.shape[1]==1 else a[:,:2];o=np.zeros((N,2),np.float32);o[:min(N,len(a))]=a[:N];return o
score,fx,nar,aiva=load('score.wav'),load('sfx.wav'),load('narration.wav'),load('aiva-voice.wav')
rows=json.loads((ROOT/'production/v5/narration.json').read_text())
duck=np.ones(N,np.float32)
for r in rows:
    a=max(0,round((r['start']-.25)*SR));b=min(N,round((r['end']+.35)*SR));duck[a:b]=np.minimum(duck[a:b],.32)
k=round(.12*SR);duck=np.convolve(duck,np.ones(k)/k,mode='same').astype(np.float32)
voice=nar*1.0+aiva*1.05
mix=score*duck[:,None]*.95+fx*.55+voice*1.0
# loudness to about -14 LUFS (RMS proxy over speech-weighted mix), true-peak safe
rms=np.sqrt(np.mean(mix**2))+1e-9;mix*=10**(-16.5/20)/rms
pk=np.abs(mix).max()
if pk>.89:mix=np.tanh(mix/.89)*.89
fade=round(.6*SR);mix[-fade:]*=np.linspace(1,0,fade)[:,None]
sf.write(OUT/'master.wav',mix.astype(np.float32),SR,subtype='PCM_24')
subprocess.run(['ffmpeg','-v','error','-y','-i',str(OUT/'master.wav'),'-c:a','aac','-b:a','256k','-ar','48000','-ac','2',str(OUT/'master.m4a')],check=True)
QA.mkdir(parents=True,exist_ok=True)
(QA/'mix-stats.json').write_text(json.dumps({'duration':N/SR,'peak':float(np.abs(mix).max()),'rms_dbfs':float(20*np.log10(np.sqrt(np.mean(mix**2)))),'voice_cues':len(rows),'music':'original synthesized (production/v5/score.py)','voice':'Kokoro ONNX v1.0 preset voices, no cloning'},indent=1)+'\n')
print('V5 MIX COMPLETE')
