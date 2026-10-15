"""Generate the final contractor-story voice. Preserve explicit AY-vuh and E-V."""
from pathlib import Path
import os,json,re
os.environ['OMP_NUM_THREADS']='2'
import numpy as np
import soundfile as sf
import onnxruntime as ort
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/audio/v4';QA=ROOT/'qa/v4'
SR=48000;DURATION=90.;VOICE='af_heart'
CUES=[
 (.55,4.5,'Three jobs. Three stages. One business.'),
 (7.25,9.2,'OfficeAdmin connects your projects, your crew, and your money. So nothing gets lost between jobs.'),
 (18.35,8.5,'Price the tenant improvement. Build the estimate, with every detail tied to the job.'),
 (32.,6.8,'Schedule the panel crew. Take the same job details into the field.'),
 (43.1,8.2,'Get approval. Invoice the work. Track the payment, right through to your books.'),
 (56.7,3.7,'Meet AIVA.'),
 (62.4,9.6,'She brings the context across your jobs, spots what needs attention, and prepares the follow-up.'),
 (72.6,3.7,'Ready for your review. Not sent.'),
 (77.4,6.4,'Commercial. Residential. EV. Less chasing. More building.'),
 (84.25,2.75,'OfficeAdmin with AIVA. Built for contractors.'),
 (87.15,2.75,'Run the work. Not the runaround.'),
]
OUT.mkdir(parents=True,exist_ok=True);QA.mkdir(parents=True,exist_ok=True)
meta_path=ROOT/'production/v4/narration.json'
previous=json.loads(meta_path.read_text()) if meta_path.exists() else []
opts=ort.SessionOptions();opts.intra_op_num_threads=2;opts.inter_op_num_threads=1
engine=Kokoro.from_session(ort.InferenceSession(str(ROOT/'.models/kokoro-v1.0.onnx'),sess_options=opts,providers=['CPUExecutionProvider']),str(ROOT/'.models/voices-v1.0.bin'))
tok=Tokenizer();rows=[];stem=np.zeros(round(SR*DURATION),dtype='float32')
for i,(start,slot,text) in enumerate(CUES):
    tokens=re.split(r'(AIVA|\bEV\b)',text.replace('OfficeAdmin','Office Admin'))
    phones=' '.join('ˈeɪvə' if p=='AIVA' else 'ˈiː ˈviː' if p=='EV' else tok.phonemize(p,lang='en-us') for p in tokens if p)
    file=OUT/f'vo-{i:02}.wav';old=next((r for r in previous if r.get('index')==i),None)
    cached=old and old.get('text')==text and old.get('phonemes')==phones and file.exists()
    if cached:
        audio,sr=sf.read(file,dtype='float32');speed=old['speed'];duration=len(audio)/sr
    else:
        speed=.98
        for attempt in range(4):
            audio,sr=engine.create(phones,voice=VOICE,speed=speed,lang='en-us',is_phonemes=True,sentence_pause=.23,clause_pause=.10)
            nz=np.flatnonzero(np.abs(audio)>.0025)
            if nz.size:audio=audio[max(0,nz[0]-round(.055*sr)):min(len(audio),nz[-1]+round(.1*sr))]
            duration=len(audio)/sr
            if duration<=slot:break
            speed=min(1.18,speed*duration/slot*1.015)
        if duration>slot:raise RuntimeError(f'Cue {i} exceeds its slot: {duration} > {slot}')
        n=min(round(.006*sr),len(audio)//2);audio[:n]*=np.linspace(0,1,n);audio[-n:]*=np.linspace(1,0,n)
        sf.write(file,audio,sr,subtype='PCM_24')
    up=np.interp(np.arange(round(len(audio)*SR/sr))*sr/SR,np.arange(len(audio)),audio)
    pos=round(start*SR);stem[pos:pos+len(up)]+=up
    row={'index':i,'start':start,'end':start+duration,'duration':duration,'available':slot,'text':text,'phonemes':phones,'speed':speed,'voice':VOICE,'file':f'audio/v4/vo-{i:02}.wav'}
    rows.append(row);print(json.dumps(row,ensure_ascii=False),flush=True)
sf.write(OUT/'narration.wav',stem,SR,subtype='PCM_24')
meta_path.write_text(json.dumps(rows,indent=2,ensure_ascii=False)+'\n')
def ts(s,sep=','):
    ms=round(s*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}{sep}{ms%1000:03}'
(ROOT/'production/v4/captions.srt').write_text('\n'.join(f"{i+1}\n{ts(r['start'])} --> {ts(r['end'])}\n{r['text']}\n" for i,r in enumerate(rows)))
(ROOT/'production/v4/captions.vtt').write_text('WEBVTT\n\n'+'\n'.join(f"{ts(r['start'],'.')} --> {ts(r['end'],'.')}\n{r['text']}\n" for r in rows))
(QA/'narration-stats.json').write_text(json.dumps({'speechSeconds':sum(r['duration'] for r in rows),'words':sum(len(r['text'].split()) for r in rows),'duration':90,'aiva':'AY-vuh','ev':'E V','voiceCloning':False},indent=2)+'\n')
print('FINAL V4 NARRATION COMPLETE',flush=True)
