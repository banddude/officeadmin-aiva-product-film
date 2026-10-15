#!/usr/bin/env python3
"""Original OfficeAdmin + AIVA V3 90s procedural score, 120 BPM, no external samples.
Run: .voice/bin/python production/v3/score.py
Writes only public/audio/v3/music.wav and qa/v3/score-stats.json.
"""
from pathlib import Path
import json, math, hashlib, subprocess
import numpy as np
import soundfile as sf

SR=48000
BPM=120
DUR=90
N=SR*DUR
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/audio/v3/music.wav'
QA=ROOT/'qa/v3/score-stats.json'
OUT.parent.mkdir(parents=True,exist_ok=True)
QA.parent.mkdir(parents=True,exist_ok=True)
rng=np.random.default_rng(20261015)
mix=np.zeros((N,2),dtype=np.float32)
def hz(m): return 440*2**((m-69)/12)
def add(a,sec,level=1.,pan=0.,width=0.):
    p=round(sec*SR)
    if p<0: a=a[-p:];p=0
    end=min(N,p+len(a))
    if end<=p:return
    v=a[:end-p].astype(np.float32,copy=False)*level
    l=np.sqrt((1-pan)/2);r=np.sqrt((1+pan)/2)
    mix[p:end,0]+=v*l;mix[p:end,1]+=v*r
    if width:
        delay=round(width*SR)
        if end+delay<=N:mix[p+delay:end+delay,1]+=v*.11
def noise(n):return rng.standard_normal(n).astype(np.float32)
def drum(kind):
    dur={'kick':.48,'snare':.31,'hat':.105,'open':.40,'rim':.12,'tom':.31,'clap':.24}[kind]
    t=np.arange(round(dur*SR),dtype=np.float32)/SR
    if kind=='kick':
        phase=2*np.pi*(46*t+74*.027*(1-np.exp(-t/.027)))
        a=np.sin(phase)*np.exp(-t*10.8)+.19*np.sin(2*phase)*np.exp(-t*32)
        a+=noise(len(t))*.055*np.exp(-t*160)
    elif kind in ('snare','clap'):
        n=noise(len(t))
        hp=n-np.convolve(n,np.ones(23,dtype=np.float32)/23,'same')
        a=hp*.48*np.exp(-t*21)
        if kind=='snare':a+=np.sin(2*np.pi*188*t)*.22*np.exp(-t*24)
        for o in ([0,.013,.027] if kind=='clap' else [0,.008,.019]):
            a+=np.roll(hp,round(o*SR))*.16*np.exp(-np.maximum(t-o,0)*52)*(t>=o)
    elif kind in ('hat','open'):
        n=noise(len(t));hp=n-np.convolve(n,np.ones(11,dtype=np.float32)/11,'same')
        a=hp*.30*np.exp(-t*(48 if kind=='hat' else 12))
    elif kind=='tom':
        phase=2*np.pi*(115*t+50*.09*(1-np.exp(-t/.09)))
        a=np.sin(phase)*np.exp(-t*12)
    else:
        a=(noise(len(t))*.13+np.sin(2*np.pi*1050*t)*.08)*np.exp(-t*47)
    a*=np.minimum(1,t*1400)*np.minimum(1,(dur-t)*220)
    return a.astype(np.float32)
kit={k:drum(k) for k in ('kick','snare','clap','hat','open','rim','tom')}
def synth(note,dur,kind):
    t=np.arange(max(16,int(dur*SR)),dtype=np.float32)/SR; f=hz(note)
    if kind=='bass':
        phase=2*np.pi*f*t +1.7*np.exp(-t*19)*np.sin(2*np.pi*f*t)
        a=np.sin(phase)+.25*np.sin(2*phase)+.09*np.sin(3*phase)
        e=(1-np.exp(-t*135))*np.exp(-t*3.2)
    elif kind=='staccato':
        ph=2*np.pi*f*t
        a=np.sin(ph)+.25*np.sin(2*ph)+.11*np.sin(3*ph)
        e=(1-np.exp(-t*145))*np.exp(-t*9.4)
    elif kind=='bell':
        a=np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*f*2.008*t)+.11*np.sin(2*np.pi*f*3.99*t)
        e=(1-np.exp(-t*270))*np.exp(-t*4.5)
    else: # animated wide pad
        ph=2*np.pi*f*t
        a=np.sin(ph)+.42*np.sin(ph*1.003)+.15*np.sin(ph*2.007)
        e=np.minimum(1,t/1.05)*np.minimum(1,(dur-t)/.8)
        e*=.84+.16*np.sin(2*np.pi*.37*t)
    fade=np.minimum(1,(dur-t)*85)
    return (a*e*np.maximum(0,fade)).astype(np.float32)
CHORDS=[(38,[62,65,69,74]),(34,[61,65,69,73]),(41,[60,64,67,72]),(36,[59,64,67,71]),
        (38,[62,65,69,74]),(34,[61,65,69,73]),(43,[62,67,71,74]),(36,[59,64,67,72])]
SCENES=[(0,'cold open'),(6,'first interface build'),(16,'second build'),(29,'approval'),(37,'phone'),(47,'finance'),(58,'AIVA pullback'),(62,'AIVA reconstruction'),(78,'montage'),(84,'resolution'),(90,'tail end')]
def sec_gain(s):
    if s<6:return .36+.44*s/6
    if s<16:return .83
    if s<29:return 1.
    if s<37:return .78
    if s<47:return .90
    if s<58:return 1.06
    if s<62:return .20
    if s<78:return 1.03
    if s<84:return 1.14
    return max(0,(90-s)/6)**1.4*.76
# Kick, off-grid ghost snare, hats and clap patterns vary across phrases.
for bar in range(45):
    start=bar*2.
    base, notes=CHORDS[(bar//4)%8]
    weight=sec_gain(start+.6)
    sparse=start<6 or 58<=start<62 or start>=84
    rhythm=(bar//4)%4
    if start<84 and not (58<=start<62):
        kicks=([0,1.5,2.75] if rhythm==0 else [0,1.75,2.5,3.5] if rhythm==1 else [0,1.5,3.0] if rhythm==2 else [0,1.25,2.75,3.5])
        if sparse:kicks=[0,2.75]
        for i,k in enumerate(kicks):
            at=start+k*.5
            if any(abs(at-x)<.13 for x in (6,16,29,37,47,58,62,78,84)) and at not in (6,16,62,78):continue
            add(kit['kick'],at,.29*weight*(1 if i==0 else .78))
        if not sparse:
            for k in (1,3):
                add(kit['snare'],start+k*.5,.19*weight)
                add(kit['clap'],start+k*.5+.013,.13*weight,pan=.13)
            if bar%4 in (1,3):
                add(kit['rim'],start+.5*.5-.095,.16*weight,-.24)
        for i in range(8):
            at=start+i*.25+(0.021 if i%2 else 0)
            if sparse and i%2:continue
            if i>=7 and bar%4==3:continue
            add(kit['hat'],at,.065*weight*(.63 if i%2==0 else 1.0),pan=(-.26 if i%2 else .26))
        if bar%2 and not sparse:add(kit['open'],start+1.73,.052*weight,.42)
        if bar%8==7 and not sparse:
            for j in range(4):add(kit['tom'],start+1.5+j*.125,.06*(j+1)*weight,pan=-.35+j*.2)
    if start<84:
        # Push/pull syncopated bass phrases. Multiple permutations, variable note lengths.
        pat=([0,.75,1.25,2.5,3.25] if rhythm==0 else [0,.5,1.75,2.75,3.5] if rhythm==1 else [0,1.25,2.,2.75,3.75] if rhythm==2 else [0,.75,1.5,2.25,3.5])
        for j,beat in enumerate(pat):
            at=start+.5*beat
            if 58<=at<62:continue
            nt=base+(12 if j==3 and bar%4==3 else 0)
            add(synth(nt,.40 if j%3 else .56,'bass'),at,.22*sec_gain(at),pan=-.04)
        # Chord bed, fade across scenes, gentle stereo drift.
        for j,n in enumerate(notes[1:]):
            dur=min(4.4,90-start)
            add(synth(n,dur,'pad'),start,.044*weight,pan=[-.6,.13,.62][j],width=.007+j*.003)
        # Consistent five-note brand motif, spaced and intentionally repeated on select phrases.
        if bar%8 in (0,1,4) and not sparse:
            motif=([74,77,76] if bar%8==0 else [69,74] if bar%8==1 else [76,74,69])
            offsets=([0,.75,1.5] if bar%8!=1 else [.25,1.25])
            for j,(n,offset) in enumerate(zip(motif,offsets)):
                add(synth(n,.48,'staccato'),start+offset,.068*weight,pan=(-.48 if j%2 else .42),width=.014)
        if bar%4==2 and not sparse:
            add(synth(notes[-1]+12,.8,'bell'),start+1.22,.026*weight,pan=.63)
# Scene punctuation: hand-made noise sweeps, reverse anticipation and bass impact.
for hit in [6,16,29,37,47,62,78,84]:
    t=np.arange(int(.42*SR),dtype=np.float32)/SR
    a=noise(len(t))
    # Fast high-pass-ish filtered sweep, grows towards the hit.
    hp=a-np.convolve(a,np.ones(41,dtype=np.float32)/41,'same')
    ramp=np.linspace(0,1,len(t),dtype=np.float32)**2.8
    add(hp*ramp,hit-.42,.038,pan=-.3)
    if hit!=84:
        add(kit['kick'],hit,.40 if hit in [6,16,62,78] else .27)
        add(synth(38,1.1,'bass'),hit,.26)
    else:add(synth(50,2.3,'pad'),hit,.11)
# AIVA reveal: near-silence, gentle reverse bloom, then deep re-entry.
for hit in [58]:
    t=np.arange(int(1.1*SR),dtype=np.float32)/SR
    a=noise(len(t));sm=np.convolve(a,np.ones(101,dtype=np.float32)/101,'same')
    add(sm*np.linspace(0,1,len(t),dtype=np.float32)**3,hit-1.1,.12,.3)
# Resolution: longer, resolved chord and a sparse concluding brand motif.
for i,n in enumerate([50,57,62,65,69,74]):
    add(synth(n,6,'pad'),84,.083,pan=-.65+i*.26)
for n,at in [(74,84.2),(77,84.95),(76,85.7),(69,86.5)]:
    add(synth(n,1.0,'bell'),at,.065,pan=.28)
# Stereo ambience using short multitap reflections and slow moving filtered tail.
dry=mix.copy()
for delay,gain,swap in [(.089,.105,True),(.149,.071,False),(.277,.047,True),(.463,.027,False)]:
    shift=int(delay*SR)
    if swap:mix[shift:]+=dry[:-shift,::-1]*gain
    else:mix[shift:]+=dry[:-shift]*gain
# Micro fade / end silence; safe with entire 90-second output.
edge=int(.015*SR)
mix[:edge]*=np.linspace(0,1,edge,dtype=np.float32)[:,None]
mix[-int(.3*SR):]*=np.linspace(1,0,int(.3*SR),dtype=np.float32)[:,None]
assert np.isfinite(mix).all()
# FFmpeg loudnorm delivers LUFS and true peak target; pipe from memory, no extra files.
command=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','pipe:0',
         '-af','highpass=f=25,loudnorm=I=-18:TP=-2.5:LRA=11:print_format=summary,volume=-1.1dB',
         '-ar',str(SR),'-ac','2','-c:a','pcm_s24le',str(OUT)]
p=subprocess.run(command,input=mix.tobytes(),capture_output=True)
if p.returncode:raise RuntimeError(p.stderr.decode()[-4000:])
del mix,dry
audio,sr=sf.read(OUT,always_2d=True,dtype='float32')
assert sr==SR and audio.shape==(N,2) and np.isfinite(audio).all()
peak=float(np.max(np.abs(audio)));rms=float(np.sqrt(np.mean(audio.astype('float64')**2)))
# independently interrogate final WAV using ebur128 and astats
q=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(OUT),'-filter_complex',
'ebur128=peak=true','-f','null','-'],capture_output=True,text=True)
lines=q.stderr.splitlines()
summary='\n'.join(lines[-38:])
import re
idx=summary.rfind('Integrated loudness:')
lufs=None
if idx>=0:
    m=re.search(r'I:\s*([-+\d.]+) LUFS',summary[idx:])
    if m:lufs=float(m.group(1))
tp=None
m=re.findall(r'Peak:\s*([-+\d.]+) dBFS',summary)
if m:tp=float(m[-1])
stats={'file':str(OUT.relative_to(ROOT)),'generator':str(Path(__file__).relative_to(ROOT)),
'seconds':DUR,'sample_rate':sr,'channels':2,'frames':len(audio),'bpm':BPM,
'integrated_lufs':lufs,'true_peak_dbtp':tp,'sample_peak_dbfs':float(20*np.log10(max(peak,1e-10))),
'rms_dbfs':float(20*np.log10(max(rms,1e-10))),'nonfinite_samples':int(np.count_nonzero(~np.isfinite(audio))),
'clipped_samples':int(np.count_nonzero(np.abs(audio)>=1)), 'sha256':hashlib.sha256(OUT.read_bytes()).hexdigest(),
'scene_hits':[{'seconds':s,'event':name} for s,name in SCENES],
'provenance':'100% original procedural synthesis with seeded NumPy. No samples, pretrained audio, vocals, or external API.',
'arrangement':'Eight-chord modal cycle, four syncopated kick/bass variations, variable hats, synthesized layered snare/clap, recurring five-note motif, pad beds, reverse anticipations, hard reveal pullback and six-second cadence.',
'limitations':'No human performance or real recorded drum kit; final narration ducking and master belong to parent.'}
QA.write_text(json.dumps(stats,indent=2)+chr(10))
print(json.dumps(stats,indent=2))
