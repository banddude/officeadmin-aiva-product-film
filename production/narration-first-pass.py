"""Generate a preset-voice narration. All customer and project details are fictional."""
import os,json,time
os.environ['OMP_NUM_THREADS']='2'
import numpy as np
import soundfile as sf
import onnxruntime as ort
from kokoro_onnx import Kokoro
cues=[
 (0.75,6.3,"Running a business isn't one job. It's every job, connected."),
 (7.85,6.4,"Meet Office Admin. The business behind the work."),
 (15.65,7.65,"One place for your customers, projects, documents, and everything that happens next."),
 (24.65,8.65,"Start with the plans. Count what matters. Turn your takeoff into an estimate, with the quantities still connected."),
 (34.65,7.65,"Build the proposal. Get it approved. Turn accepted work into an invoice."),
 (43.65,7.6,"Schedule the team. Capture time where the work happens. Keep every hour tied to the job."),
 (52.65,7.55,"See your costs. Track your invoices. Reconcile the books. Know where you stand."),
 (61.65,6.6,"And meet Ava. An assistant with the context of your work."),
 (69.65,8.65,"A recorded conversation becomes more than a transcript. See what was decided, and what needs to happen next."),
 (79.65,8.5,"Ask a question. Find the detail. Prepare the follow-up. Review it. Then move it forward."),
 (89.65,7.65,"Your projects. Your people. Your numbers. Working together, instead of pulling you apart."),
 (98.75,5.4,"Less chasing. More building."),
 (105.65,5.65,"Office Admin and Ava. Run the work. Not the runaround.")]
opts=ort.SessionOptions();opts.intra_op_num_threads=2;opts.inter_op_num_threads=1
model=ort.InferenceSession('.models/kokoro-v1.0.onnx',sess_options=opts,providers=['CPUExecutionProvider'])
k=Kokoro.from_session(model,'.models/voices-v1.0.bin')
print('voices',k.get_voices(),flush=True)
meta=[]
for i,(start,available,text) in enumerate(cues):
 t=time.time(); speed=1.0
 audio,sr=k.create(text,voice='af_heart',speed=speed,lang='en-us')
 idx=np.flatnonzero(np.abs(audio)>.003)
 if len(idx):audio=audio[max(0,idx[0]-int(.07*sr)):min(len(audio),idx[-1]+int(.1*sr))]
 duration=len(audio)/sr
 if duration>available:
  speed=min(1.23,duration/available*1.025)
  audio,sr=k.create(text,voice='af_heart',speed=speed,lang='en-us')
  idx=np.flatnonzero(np.abs(audio)>.003)
  if len(idx):audio=audio[max(0,idx[0]-int(.07*sr)):min(len(audio),idx[-1]+int(.1*sr))]
  duration=len(audio)/sr
 audio=audio*(.75/max(.75,np.max(np.abs(audio))))
 path=f'public/audio/vo-{i:02}.wav'; sf.write(path,audio,sr)
 row=dict(index=i,start=start,end=start+duration,duration=duration,available=available,speed=speed,text=text,file=path)
 meta.append(row);print(json.dumps(row),'render_seconds',round(time.time()-t,1),flush=True)
with open('production/narration.json','w') as fh:json.dump(meta,fh,indent=2)
print('NARRATION COMPLETE',flush=True)
