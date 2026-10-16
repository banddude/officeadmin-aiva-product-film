"""V5 '9:14 PM' original score + sound design, synthesized from scratch (no samples, no stock music).
Arc follows production/v5/timeline.json: night tension -> AIVA lift -> morning groove -> late-night catch ->
wall sting -> payoff build -> recap hits -> end chord. Runs on the laptop."""
from pathlib import Path
import json
import numpy as np
import soundfile as sf

ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'public/audio/v5';OUT.mkdir(parents=True,exist_ok=True)
TL=json.loads((ROOT/'production/v5/timeline.json').read_text())
SR=48000;DUR=float(TL['duration']);N=round(SR*DUR)
rng=np.random.default_rng(91415)
music=np.zeros((N,2),np.float32);fx=np.zeros((N,2),np.float32)
BPM=112.0;BEAT=60/BPM;BAR=4*BEAT

def t(d):return np.arange(round(d*SR))/SR
def env(n,a=.005,r=.2,sus=1.0):
    x=np.ones(n,np.float32)*sus;na=max(1,min(n,round(a*SR)));nr=max(1,min(n-na if n>na else n,round(r*SR)))
    x[:na]=np.linspace(0,sus,na);x[-nr:]*=np.linspace(1,0,nr);return x
def lpf(x,c):  # fast block lowpass via FFT brickwall-ish taper
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X*=1/(1+(f/c)**4);return np.fft.irfft(X,len(x)).astype(np.float32)
def hpf(x,c):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X*=1/(1+(c/np.maximum(f,1))**4);return np.fft.irfft(X,len(x)).astype(np.float32)
def put(buf,sig,start,gain=1.0,pan=0.0):
    p=round(start*SR)
    if p>=N:return
    if p<0:sig=sig[-p:];p=0
    n=min(len(sig),N-p)
    if n<=0:return
    buf[p:p+n,0]+=sig[:n]*gain*np.sqrt((1-pan)/2);buf[p:p+n,1]+=sig[:n]*gain*np.sqrt((1+pan)/2)
def hz(m):return 440*2**((m-69)/12)
def saw(f,d):x=t(d);return (2*((x*f)%1)-1).astype(np.float32)
def sine(f,d):return np.sin(2*np.pi*f*t(d)).astype(np.float32)

# --- instruments ---
def pad(notes,d,bright=900):
    s=np.zeros(round(d*SR),np.float32)
    for m in notes:
        for det in(-.12,0,.11):s+=saw(hz(m+det),d)
    s=lpf(s/len(notes)/3,bright);return s*env(len(s),a=.6,r=.9)
def keys(notes,d,vel=.5):
    s=np.zeros(round(d*SR),np.float32)
    for m in notes:x=t(d);s+=(np.sin(2*np.pi*hz(m)*x)+.35*np.sin(2*np.pi*2*hz(m)*x)+.12*np.sin(2*np.pi*3*hz(m)*x)).astype(np.float32)*np.exp(-x*2.2).astype(np.float32)
    return s/len(notes)*vel*env(len(s),a=.004,r=.15)
def kick():x=t(.38);f=48+90*np.exp(-x*28);return (np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*7.5)).astype(np.float32)
def clap():n=round(.22*SR);s=rng.standard_normal(n).astype(np.float32);s=hpf(lpf(s,5200),900);e=np.exp(-t(.22)*24).astype(np.float32);return s*e*.8
def hat(open_=False):d=.24 if open_ else .05;s=hpf(rng.standard_normal(round(d*SR)).astype(np.float32),7000);return s*np.exp(-t(d)*(14 if open_ else 70)).astype(np.float32)*.5
def bass(m,d):s=saw(hz(m),d)+.5*sine(hz(m-12),d);return lpf(s,420)*env(round(d*SR),a=.004,r=.06)*.55
def pluck(m,d=.35):x=t(d);return (np.sin(2*np.pi*hz(m)*x)*np.exp(-x*9)+.3*np.sin(2*np.pi*hz(m+12)*x)*np.exp(-x*14)).astype(np.float32)*.45

# Progressions (A minor -> C major lift). Night: Am - F - C - G ; Day: C - G - Am - F
NIGHT=[[57,60,64],[53,57,60],[48,55,60],[55,59,62]]
DAY=[[60,64,67],[55,59,62],[57,60,64],[53,57,60]]
BASSN={tuple(c):c[0]-12 for c in NIGHT+DAY}

def section(a,b,prog,drums,keys_on=True,bass_on=True,pad_g=.16,hats=True,bright=900,keys_v=.35):
    x=a;i=0
    while x<b-.01:
        ch=prog[i%len(prog)];d=min(BAR,b-x)
        put(music,pad(ch+[ch[0]+12],d,bright),x,pad_g,0)
        if bass_on:
            for k in range(8):
                bt=x+k*BEAT/2
                if bt<b and (k%2==0 or k in(3,7)):put(music,bass(BASSN[tuple(ch)],BEAT/2*.9),bt,.9)
        if keys_on:
            for k,off in enumerate((0,1.5,2.5,3.5)):
                bt=x+off*BEAT
                if bt<b:put(music,keys([ch[(k+1)%3]+12],BEAT*.9,keys_v),bt,1,(-.3,.3)[k%2])
        if drums:
            for k in range(4):
                bt=x+k*BEAT
                if bt>=b:break
                if k in(0,2):put(music,kick(),bt,.85)
                if k in(1,3):put(music,clap(),bt,.32,.1)
                if hats:
                    put(music,hat(),bt+BEAT/2,.35,.4);put(music,hat(),bt,.2,-.4)
        x+=BAR;i+=1

S={s['id']:(s['start'],s['end']) for s in TL['scenes']}
# night intro: pad + heartbeat pulse
section(0,S['aiva'][0],NIGHT,False,keys_on=True,bass_on=False,pad_g=.13,bright=650,keys_v=.25)
for k in np.arange(.3,S['aiva'][0],BEAT):put(music,kick()*.6,k,.35)
# AIVA lift into the groove
put(music,pad([60,64,67,72,76],5,2400),S['aiva'][0],.16)
section(S['takeoff'][0],S['title'][0],DAY,True,bright=1300)
# title: half-time anthem chord
put(music,pad([48,55,60,64,67,72],8.2,1800),S['title'][0],.24);put(music,kick(),S['title'][0],1.0)
for k in range(4):put(music,keys([72,76,79],BEAT*1.8,.4),S['title'][0]+k*2*BEAT,1)
# morning groove
section(S['signed'][0],S['catch'][0],DAY,True,bright=1500)
# late night catch: tension pad + clock tick, resolve on approve
section(S['catch'][0],S['catch'][1]-2.2,NIGHT,False,bass_on=True,pad_g=.14,bright=600,keys_v=.2)
for k in np.arange(S['catch'][0],S['catch'][1]-2.2,BEAT):put(music,hpf(rng.standard_normal(600).astype(np.float32),3000)*np.exp(-t(600/SR)*80).astype(np.float32),k,.18)
put(music,pad([60,64,67,72],3,2000),S['catch'][1]-2.2,.18)
# monday + photos groove
section(S['monday'][0],S['wall'][0]+1.2,DAY,True,bright=1500)
# wall: stop, sting, tension, resolve
section(S['wall'][0]+3.2,S['wall'][0]+12.0,NIGHT,False,keys_on=False,pad_g=.12,bright=500)
for k in np.arange(S['wall'][0]+3.4,S['wall'][0]+12.0,BEAT/2):put(music,bass(45,BEAT/2*.8),k,.6)
section(S['wall'][0]+12.0,S['books'][0],DAY,True,bright=1700)
# payoff build: full groove with open hats
section(S['books'][0],S['recap'][0],DAY,True,bright=2200,keys_v=.4)
for k in np.arange(S['books'][0],S['recap'][0],BEAT):put(music,hat(True),k+BEAT/2,.18,.3)
# recap: hit per badge
r0=S['recap'][0]
for i in range(len(TL['badges'])):
    bt=r0+(10+i*6)/30;put(music,kick(),bt,.5);put(music,pluck(72+[0,2,4,7,9,12,14,16][i%8]),bt,.7,(-.4,.4)[i%2])
put(music,pad([48,55,60,64,67],5,1600),r0,.14)
# end chord
put(music,pad([48,55,60,64,67,72,76],6.4,2000),S['end'][0],.26);put(music,kick(),S['end'][0],1.0)
put(music,keys([72,76,79,84],4,.5),S['end'][0]+.1,1)

# --- sound design ---
def buzz():x=t(.42);s=np.sign(np.sin(2*np.pi*150*x))*(np.sin(2*np.pi*22*x)>0);return lpf(s.astype(np.float32),900)*env(len(x),.01,.05)*.5
def pop():x=t(.09);return (np.sin(2*np.pi*(900+600*np.exp(-x*60))*x)*np.exp(-x*45)).astype(np.float32)*.6
def glasses():return np.concatenate([pluck(88,.12)*.8,pluck(93,.3)])
def blink():return np.concatenate([sine(1320,.05)*env(round(.05*SR),.002,.02),sine(1760,.08)*env(round(.08*SR),.002,.05)])*.35
def tap():x=t(.05);return (rng.standard_normal(len(x))*np.exp(-x*160)).astype(np.float32)*.35
def sent():x=t(.45);f=500+1800*x/.45;return (np.sin(2*np.pi*np.cumsum(f)/SR)*env(len(x),.02,.2)).astype(np.float32)*.18
def sign():x=t(.5);s=hpf(rng.standard_normal(len(x)).astype(np.float32),2500)*(.5+.5*np.sin(2*np.pi*11*x));return s*env(len(x),.02,.1).astype(np.float32)*.18
def paid():return (keys([84,88,91],.9,1.0)*1.2).astype(np.float32)
def shutter():return np.concatenate([tap()*2,np.zeros(1200,np.float32),tap()*1.5])
def creak():x=t(.9);f=90+25*np.sin(2*np.pi*3*x);return lpf((np.sin(2*np.pi*np.cumsum(f)/SR)*env(len(x),.1,.3)).astype(np.float32),600)*.4
def sting():
    s=np.zeros(round(1.8*SR),np.float32)
    for m in(33,40,45,48):s+=saw(hz(m),1.8)
    return lpf(s/4,700)*env(len(s),.01,1.2)*.9+np.pad(kick(),(0,len(s)-len(kick())))*.8
def check():return sine(1568,.12)*env(round(.12*SR),.002,.08)*.3
def stamp():
    k=kick();n=hpf(rng.standard_normal(4000).astype(np.float32),800)*np.exp(-t(4000/SR)*40).astype(np.float32);o=np.zeros(max(len(k),len(n)),np.float32);o[:len(k)]+=k*.9;o[:len(n)]+=n*.3;return o
def crowd():x=t(2.6);s=lpf(hpf(rng.standard_normal(len(x)).astype(np.float32),300),2400)*env(len(x),.5,1.2);return s*.25
def clack():return lpf(rng.standard_normal(700).astype(np.float32),3000)*np.exp(-t(700/SR)*80).astype(np.float32)*.8
FX={'buzz':buzz,'pop':pop,'glasses':glasses,'blink':blink,'tap':tap,'sent':sent,'sign':sign,'paid':paid,'shutter':shutter,'creak':creak,'sting':sting,'check':check,'stamp':stamp,'crowd':crowd}
for e in TL['sfx']:put(fx,FX[e['kind']](),float(e['t']),.9,0)
for i,b in enumerate(TL['badges']):put(fx,clack(),float(b['t']),.7,.5);put(fx,pluck(79+[0,2,4,5,7,9,11,12][i%8],.25),float(b['t'])+.03,.35,.5)
# music drops out for the wall reveal
a,b=round((S['wall'][0]+.9)*SR),round((S['wall'][0]+3.2)*SR);music[a:b]*=np.linspace(1,.05,b-a)[:,None]
peak=max(np.abs(music).max(),1e-6);music*=.5/peak;fx*=.7/max(np.abs(fx).max(),1e-6)
sf.write(OUT/'score.wav',music,SR,subtype='PCM_24');sf.write(OUT/'sfx.wav',fx,SR,subtype='PCM_24')
print('V5 SCORE COMPLETE',DUR)
