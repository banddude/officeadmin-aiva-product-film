"""Sparse preset narration for the V3 kinetic film. AIVA is explicit AY-vuh."""
import os
os.environ['OMP_NUM_THREADS']='2'
from pathlib import Path
import json
import numpy as np
import soundfile as sf
import onnxruntime as ort
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer
SR=48000;DURATION=90
OUT=Path('public/audio/v3');OUT.mkdir(parents=True,exist_ok=True)
CUES=[
 (0.65,2.8,'Less runaround.'),
 (6.40,4.1,'Office Admin. Your business, connected.'),
 (17.00,5.0,'Build the estimate. Keep every detail with the work.'),
 (30.20,4.7,'From approved work to a clearer picture.'),
 (40.60,3.8,'Wherever work takes you.'),
 (48.30,3.5,'Know where you stand.'),
 (58.55,2.5,'And AIVA.'),
 (63.15,3.1,'Ask about your work.'),
 (71.05,5.8,'Turn context into a useful next step. Ready for your review.'),
 (84.50,5.0,'Office Admin and AIVA. Run the work. Not the runaround.'),
]
models=Path(os.environ.get('KOKORO_MODELS','.models'))
options=ort.SessionOptions();options.intra_op_num_threads=2;options.inter_op_num_threads=1
engine=Kokoro.from_session(ort.InferenceSession(str(models/'kokoro-v1.0.onnx'),sess_options=options,providers=['CPUExecutionProvider']),str(models/'voices-v1.0.bin'))
tok=Tokenizer();stem=np.zeros(SR*DURATION,dtype=np.float32);rows=[]
for i,(start,slot,text) in enumerate(CUES):
 phones=' ˈeɪvə '.join(tok.phonemize(part,lang='en-us') for part in text.split('AIVA'))
 speed=1.0
 for attempt in range(3):
  audio,sr=engine.create(phones,voice='af_heart',speed=speed,lang='en-us',is_phonemes=True,sentence_pause=.20,clause_pause=.10)
  nz=np.flatnonzero(np.abs(audio)>.0025)
  if nz.size:audio=audio[max(0,nz[0]-round(.045*sr)):min(len(audio),nz[-1]+round(.10*sr))]
  duration=len(audio)/sr
  if duration<=slot:break
  speed*=duration/slot*1.01
 if duration>slot+.02:raise RuntimeError(f'Cue {i} overruns its slot')
 n=round(sr*.006);audio[:n]*=np.linspace(0,1,n);audio[-n:]*=np.linspace(1,0,n)
 sf.write(OUT/f'vo-{i:02d}.wav',audio,sr,subtype='PCM_24')
 up=np.interp(np.arange(round(len(audio)*SR/sr))*sr/SR,np.arange(len(audio)),audio)
 p=round(start*SR);stem[p:p+len(up)]+=up
 row={'index':i,'start':start,'end':start+duration,'text':text.replace('Office Admin','OfficeAdmin'),'phonemes':phones,'voice':'af_heart','speed':speed,'duration':duration,'file':f'audio/v3/vo-{i:02d}.wav'};rows.append(row);print(json.dumps(row),flush=True)
sf.write(OUT/'narration.wav',stem,SR,subtype='PCM_24')
Path('production/v3/narration.json').write_text(json.dumps(rows,indent=2)+'\n')
def ts(s,sep=','):
 ms=round(s*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}{sep}{ms%1000:03}'
Path('production/v3/captions.srt').write_text('\n'.join(f"{i+1}\n{ts(r['start'])} --> {ts(r['end'])}\n{r['text']}\n" for i,r in enumerate(rows)))
Path('production/v3/captions.vtt').write_text('WEBVTT\n\n'+'\n'.join(f"{ts(r['start'],'.')} --> {ts(r['end'],'.')}\n{r['text']}\n" for r in rows))
Path('qa/v3/narration-stats.json').write_text(json.dumps({'seconds':90,'speechSeconds':sum(r['duration'] for r in rows),'words':sum(len(r['text'].split()) for r in rows),'name':'AIVA','pronunciation':'AY-vuh','phonemes':'ˈeɪvə','noVoiceCloning':True},indent=2)+'\n')
