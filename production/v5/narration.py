"""V5 '9:14 PM' narration. Laptop only (never Oracle). Kokoro ONNX v1.0 preset voices, no cloning.
AIVA is forced to AY-vuh (/ˈeɪvə/); AM/PM are spoken as letters. Each cue must fit its slot."""
from pathlib import Path
import os,json,re,sys
os.environ['OMP_NUM_THREADS']='4'
import numpy as np
import soundfile as sf
import onnxruntime as ort
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/audio/v5';QA=ROOT/'qa/v5'
TL=json.loads((ROOT/'production/v5/timeline.json').read_text())
SR=48000;DURATION=float(TL['duration']);VOICES={'narrator':TL['voices']['narrator'],'aiva':TL['voices']['aiva']}
SPECIAL={'AIVA':'ˈeɪvə','AM':'ˌeɪˈɛm','PM':'ˌpiːˈɛm'}
OUT.mkdir(parents=True,exist_ok=True);QA.mkdir(parents=True,exist_ok=True)
M=ROOT/'.tts/models'
opts=ort.SessionOptions();opts.intra_op_num_threads=4;opts.inter_op_num_threads=1
engine=Kokoro.from_session(ort.InferenceSession(str(M/'kokoro-v1.0.onnx'),sess_options=opts,providers=['CPUExecutionProvider']),str(M/'voices-v1.0.bin'))
tok=Tokenizer();over=[];rows=[];stem=np.zeros(round(SR*DURATION),dtype='float32');aiva_stem=np.zeros_like(stem)
for i,cue in enumerate(TL['cues']):
    text,start,slot,role=cue['text'],float(cue['start']),float(cue['slot']),cue['voice']
    parts=re.split(r'\b(AIVA|AM|PM)\b',text.replace('OfficeAdmin','Office Admin'))
    phones=' '.join(SPECIAL[p] if p in SPECIAL else tok.phonemize(p,lang='en-us') for p in parts if p.strip())
    speed=1.04 if role=='narrator' else 1.0
    for attempt in range(6):
        audio,sr=engine.create(phones,voice=VOICES[role],speed=speed,lang='en-us',is_phonemes=True)
        nz=np.flatnonzero(np.abs(audio)>.0025)
        if nz.size:audio=audio[max(0,nz[0]-round(.04*sr)):min(len(audio),nz[-1]+round(.09*sr))]
        duration=len(audio)/sr
        if duration<=slot:break
        speed=min(1.22,speed*duration/slot*1.02)
    if duration>slot:over.append((i,round(duration,2),slot,text))
    n=min(round(.006*sr),len(audio)//2);audio[:n]*=np.linspace(0,1,n);audio[-n:]*=np.linspace(1,0,n)
    file=OUT/f'vo-{i:02}.wav';sf.write(file,audio,sr,subtype='PCM_24')
    up=np.interp(np.arange(round(len(audio)*SR/sr))*sr/SR,np.arange(len(audio)),audio).astype('float32')
    pos=round(start*SR);(aiva_stem if role=='aiva' else stem)[pos:pos+len(up)]+=up
    row={'index':i,'start':start,'end':round(start+duration,3),'duration':round(duration,3),'slot':slot,'voice':VOICES[role],'role':role,'speed':round(speed,3),'text':text,'phonemes':phones,'file':f'audio/v5/vo-{i:02}.wav'}
    rows.append(row);print(json.dumps(row,ensure_ascii=False),flush=True)
sf.write(OUT/'narration.wav',stem,SR,subtype='PCM_24');sf.write(OUT/'aiva-voice.wav',aiva_stem,SR,subtype='PCM_24')
(ROOT/'production/v5/narration.json').write_text(json.dumps(rows,indent=1,ensure_ascii=False)+'\n')
(QA/'pronunciation.json').write_text(json.dumps({'name':'AIVA','required':'AY-vuh','ipa':'/ˈeɪvə/','synthesis_token':'ˈeɪvə','cues':[r['index'] for r in rows if 'AIVA' in r['text']]},indent=1,ensure_ascii=False)+'\n')
if over:
    print('OVERRUNS',json.dumps(over,ensure_ascii=False),flush=True);sys.exit(3)
print('V5 NARRATION COMPLETE',sum(r['duration'] for r in rows),flush=True)
