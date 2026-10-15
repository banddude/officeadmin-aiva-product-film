"""Mix the original V3 score, explicit-pronunciation narration and tactile UI sound."""
from pathlib import Path
import json, subprocess, re
import numpy as np
import soundfile as sf
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/audio/v3';QA=ROOT/'qa/v3';SR=48000;N=90*SR
music,sr=sf.read(OUT/'music.wav',dtype='float32',always_2d=True)
voice,vr=sf.read(OUT/'narration.wav',dtype='float32');cues=json.loads((ROOT/'production/v3/narration.json').read_text())
assert sr==vr==SR and music.shape==(N,2) and len(voice)==N
# Equal-power, center narration, cue-wise level consistency before the final bus.
vo=np.zeros(N,dtype='float32')
for cue in cues:
 a=round(cue['start']*SR);b=round(cue['end']*SR);raw=voice[a:b]
 active=raw[np.abs(raw)>.012];rms=float(np.sqrt(np.mean(active**2)))
 gain=min(2.8,.17/max(rms,.001));vo[a:b]=raw*gain
# Short voice-aware music ducking. The original transient hits still lead the cut.
duck=np.ones(N,dtype='float32')
for cue in cues:
 a=max(0,round((cue['start']-.15)*SR));b=round(cue['start']*SR);e=round(cue['end']*SR);z=min(N,e+round(.36*SR))
 duck[a:b]=np.minimum(duck[a:b],np.linspace(1,.47,b-a));duck[b:e]=np.minimum(duck[b:e],.47);duck[e:z]=np.minimum(duck[e:z],np.linspace(.47,1,z-e))
# Purposeful, quiet tactile ticks on UI assembly. Not notification spam.
sfx=np.zeros((N,2),dtype='float32');rng=np.random.default_rng(310261015)
def add(sample,time,gain=1,pan=0):
 p=round(time*SR);n=min(N-p,len(sample));v=sample[:n]*gain
 sfx[p:p+n,0]+=v*np.sqrt((1-pan)/2);sfx[p:p+n,1]+=v*np.sqrt((1+pan)/2)
def tick(pitch=760):
 t=np.arange(int(.065*SR))/SR
 n=rng.normal(0,1,len(t));n=n-np.convolve(n,np.ones(9)/9,'same')
 return ((np.sin(2*np.pi*pitch*t)*.24+n*.075)*np.exp(-t*95)*np.minimum(1,t*1600)).astype('float32')
for i,time in enumerate([6.15,6.55,7.03,7.57,8.1,17.60,18.16,18.73,19.3,37.7,47.55,48.0,48.43,48.87,49.3]):
 add(tick(580+(i%4)*110),time,.17,(-.24 if i%2 else .24))
# Gentle two-note confirmation uses our own oscillators.
for j,note in enumerate([76,81]):
 t=np.arange(int(.24*SR))/SR;hz=440*2**((note-69)/12)
 a=(np.sin(2*np.pi*hz*t)+.15*np.sin(2*np.pi*2*hz*t))*np.exp(-t*19)*np.minimum(1,t*400)
 add(a.astype('float32'),29.42+j*.085,.016)
premaster=music*duck[:,None]+vo[:,None]*.78+sfx
peak=float(np.max(np.abs(premaster)))
if peak>.94:premaster*=.94/peak
assert np.isfinite(premaster).all()
sf.write(OUT/'narration-balanced.wav',vo,SR,subtype='PCM_24')
sf.write(OUT/'ui-sound.wav',sfx,SR,subtype='PCM_24')
sf.write(OUT/'premaster.wav',premaster,SR,subtype='PCM_24')
subprocess.run(['python3',str(ROOT/'production/master-audio.py'),str(OUT/'premaster.wav'),str(OUT/'master.wav'),'--overwrite'],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(OUT/'master.wav'),'-c:a','aac','-b:a','320k','-ar','48000','-movflags','+faststart',str(OUT/'master.m4a')],check=True)
q=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(OUT/'master.m4a'),'-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
j=json.loads(re.findall(r'\{\s*"input_i".*?\}',q.stderr,re.S)[-1]);assert -16.8<float(j['input_i'])<-15.2;assert float(j['input_tp'])<=-1.0
stats={'duration':90,'sampleRate':SR,'channels':2,'encodedIntegratedLufs':float(j['input_i']),'encodedTruePeakDbtp':float(j['input_tp']),'speechSeconds':sum(c['duration'] for c in cues),'narrationCues':len(cues),'musicDuckingDb':round(20*np.log10(.47),2),'voice':'Kokoro af_heart preset, explicit AY-vuh phonemes','music':'Original V3 procedural score','soundEffects':'Original oscillator/noise synthesis synchronized to UI','noClipping':True,'humanListeningReview':False}
(QA/'mix-stats.json').write_text(json.dumps(stats,indent=2)+'\n');print(json.dumps(stats,indent=2),flush=True)
