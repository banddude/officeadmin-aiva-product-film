"""Original electronic score and frame-cued sound design, composed for this film.
No samples, stock music, cloned voices, or copyrighted music are used.
"""
import json,math
from pathlib import Path
import numpy as np
import soundfile as sf
SR=48000; SECONDS=112; N=int(SR*SECONDS)
rng=np.random.default_rng(104214)
music=np.zeros((N,2),np.float32);sfx=np.zeros_like(music);voice=np.zeros_like(music)
def add(dest,sig,start,amp=1.,pan=0.):
 i=int(start*SR)
 if i>=N:return
 if sig.ndim==1:
  sig=np.stack([sig*np.sqrt((1-pan)/2),sig*np.sqrt((1+pan)/2)],axis=-1)
 if i<0:sig=sig[-i:];i=0
 n=min(len(sig),N-i);dest[i:i+n]+=sig[:n].astype(np.float32)*amp
def tone(freq,dur,kind='pluck'):
 t=np.arange(int(dur*SR))/SR
 if kind=='pad':
  env=np.minimum(t/1.9,1)*np.minimum((dur-t)/2.9,1)
  env=np.clip(env,0,1)**1.5
  left=(np.sin(2*np.pi*freq*.9988*t)+.18*np.sin(2*np.pi*freq*2*t+.5)+.04*np.sin(2*np.pi*freq*3*t))*env
  right=(np.sin(2*np.pi*freq*1.0012*t+.27)+.18*np.sin(2*np.pi*freq*2.002*t)+.04*np.sin(2*np.pi*freq*3.001*t))*env
  return np.stack([left,right],-1)*(.91+.09*np.sin(t*.7))[:,None]
 if kind=='bass':
  env=np.minimum(t/.02,1)*np.exp(-t*3.3)*np.minimum((dur-t)/.08,1)
  return (.82*np.sin(2*np.pi*freq*t)+.15*np.sin(2*np.pi*freq*2*t)+.03*np.sin(2*np.pi*freq*3*t))*env
 env=(1-np.exp(-t*220))*np.exp(-t*3.1)*np.minimum((dur-t)/.09,1)
 return (np.sin(2*np.pi*freq*t)+.21*np.sin(2*np.pi*freq*2*t)*np.exp(-t*4)+.09*np.sin(2*np.pi*freq*3.006*t)*np.exp(-t*7))*env
def midi(n):return 440*2**((n-69)/12)
chords=[[50,57,60,64],[46,53,57,60],[41,53,57,64],[48,55,62,64]]
for ix,start in enumerate(np.arange(-1.6,111,9.6)):
 chord=chords[ix%4]
 if start>103:chord=[41,53,57,60,67]
 for j,note in enumerate(chord):add(music,tone(midi(note),12.6,'pad'),start,.015*(1 if j<3 else .72))
# A mallet figure enters after the identity reveal. Eight notes, with silence between statements.
for beat in range(171):
 st=15+beat*.6
 if st>98:break
 if 60.7<st<69:continue
 step=beat%8;chord=chords[int((st+1.6)/9.6)%4]
 if step in (0,1,3,4,6):
  note=chord[[2,3,1,2,3,0,3,2][step]]+12
  amp=.030 if st<43 else .036
  add(music,tone(midi(note),2.2),st,amp,pan=[-.55,.45,-.2,.55,.1,-.4,.25,0][step])
  add(music,tone(midi(note),1.4),st+.30,amp*.22,pan=-.6 if step%2 else .6)
 if step in (0,3,4,7):add(music,tone(midi(chord[0]-12),.75,'bass'),st,.087,pan=0)
 if step in (0,4):
  t=np.arange(int(.31*SR))/SR
  kick=np.sin(2*np.pi*(48*t+3.4*(1-np.exp(-t*38))))*np.exp(-t*16)*(1-np.exp(-t*800))
  add(music,kick,st,.12)
 if step in (2,6):
  t=np.arange(int(.10*SR))/SR;noise=rng.normal(0,1,len(t));noise=np.concatenate([[0],np.diff(noise)])
  sn=noise*np.exp(-t*57)*np.sin(np.minimum(t/.002,1)*np.pi/2)
  add(music,sn,st,.009,pan=.1)
 if st>32:
  t=np.arange(int(.036*SR))/SR;h=rng.normal(0,1,len(t));h=np.concatenate([[0],np.diff(h)])*np.exp(-t*125)
  add(music,h,st+.3,.004,pan=(-.55 if step%2 else .55))
# Soft UI ticks and tuned confirmations, aligned to visible gestures.
for st in [1.1,1.45,1.8,2.2,2.6,3.1,25.3,25.8,26.3,26.8,27.3,27.8,36.53,39.47,47.07,55.15,58.9,74.5,75.35,76.15,87.47]:
 add(sfx,tone(midi(86 if st<30 else 81),.18),st,.014,pan=np.sin(st)*.25)
for st in [7.05,39.5,55.15,87.52,101.05,105.3]:
 for j,note in enumerate([65,72,76]):add(sfx,tone(midi(note),2.5),st+j*.07,.028 if st>98 else .015,pan=(j-1)*.2)
# Filtered air transitions, not stock whooshes.
for k,st in enumerate([7,15,24,34,43,52,61,69,79,89,98,105]):
 dur=.75;t=np.arange(int(dur*SR))/SR;noise=rng.normal(0,1,len(t));freq=np.fft.rfftfreq(len(t),1/SR)
 weight=np.exp(-((freq-(1700 if k%2 else 2600))/2100)**2)
 air=np.fft.irfft(np.fft.rfft(noise)*weight,n=len(t));air/=max(1,np.max(np.abs(air)))
 env=np.sin(np.pi*t/dur)**2;air*=env
 pan=np.linspace(-.5,.5,len(t));stereo=np.stack([air*np.sqrt((1-pan)/2),air*np.sqrt((1+pan)/2)],-1)
 add(sfx,stereo,st-.51,.018)
# Decisive breath before the closing promise, followed by an open major resolve.
g=np.ones(N,np.float32)
for a,b,level in [(0,7,.46),(60.7,69,.48),(97.8,101.0,.21)]:
 ia,ib=int(a*SR),int(b*SR);g[ia:ib]*=level
music*=g[:,None]
for st in [101.1,105.3]:
 for note in [41,53,57,60,67]:add(music,tone(midi(note),9.0,'pad'),st-1.2,.021)
for st,note in [(101.15,77),(102.35,76),(103.55,72),(105.3,77),(106.5,79),(107.7,81)]:add(music,tone(midi(note),3.0),st,.032,pan=.25 if note%2 else -.25)
meta=json.load(open('production/narration.json'));duck=np.ones(N,np.float32)
for item in meta:
 wav,sr=sf.read(item['file']);
 if wav.ndim>1:wav=wav.mean(axis=1)
 # Subtle level matching across independently generated phrases.
 rms=np.sqrt(np.mean(wav**2));gain=min(2.4,.11/max(rms,.001));wav=wav*gain
 if sr!=SR:wav=np.interp(np.arange(round(len(wav)*SR/sr))*sr/SR,np.arange(len(wav)),wav)
 add(voice,wav,item['start'],1)
 i=max(0,int((item['start']-.22)*SR));j=min(N,int((item['end']+.3)*SR));env=np.ones(j-i)*.52
 ramp=min(int(.22*SR),len(env)//3);env[:ramp]=np.linspace(1,.52,ramp);env[-ramp:]=np.linspace(.52,1,ramp)
 duck[i:j]=np.minimum(duck[i:j],env)
fade=np.minimum(np.arange(N)/(SR*.5),1)*np.minimum((N-np.arange(N))/(SR*2.2),1)
music*=fade[:,None];sfx*=fade[:,None]
# Preserve a music-only stem and a center narration stem for revision.
sf.write('public/audio/music-and-sound.wav',music+sfx,SR,subtype='PCM_16')
sf.write('public/audio/narration.wav',voice,SR,subtype='PCM_16')
mix=voice+(music*duck[:,None])+sfx
sf.write('public/audio/master-premaster.wav',mix,SR,subtype='PCM_24')
print(json.dumps({'duration':SECONDS,'sample_rate':SR,'peak_linear':float(np.max(np.abs(mix))),'voice_seconds':sum(x['duration'] for x in meta),'words':sum(len(x['text'].split()) for x in meta),'narration_rate_wpm':60*sum(len(x['text'].split()) for x in meta)/sum(x['duration'] for x in meta)},indent=2))
