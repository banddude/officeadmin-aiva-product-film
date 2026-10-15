"""Original 96-second score and preset narration. No samples or voice cloning.
AIVA uses explicit /eɪvə/ phonemes, rather than trusting the spelling 'Ava'.
Run from the repository root using the optional Kokoro Python environment.
"""
from pathlib import Path
import json, os, re
os.environ['OMP_NUM_THREADS'] = '2'
import numpy as np
import soundfile as sf
import onnxruntime as ort
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer

OUT = Path('public/audio/v2'); OUT.mkdir(parents=True, exist_ok=True)
QA = Path('qa/v2'); QA.mkdir(parents=True, exist_ok=True)
SR = 48000
DURATION = 96.0
CUES = [
 (0.70, 4.8, 'You started a business to do great work.'),
 (6.75, 6.3, 'Meet Office Admin. One home for the business behind it.'),
 (15.0, 7.2, 'Your customers. Your projects. Every detail, in the right place.'),
 (25.0, 6.0, 'From the first estimate to the final invoice.'),
 (34.65, 6.0, "Keep the work moving. And see what's coming in."),
 (43.0, 6.0, "At your desk. On the job. It's all right there."),
 (51.0, 5.8, 'Your costs. Your cash flow. The whole picture.'),
 (58.65, 5.15, 'And AIVA. Your assistant, with the context of your work.'),
 (65.1, 7.7, 'Ask about a project. Find a decision. Prepare the follow-up.'),
 (75.0, 5.4, 'A useful next step. Ready for your review.'),
 (83.0, 4.2, 'Less switching. Less chasing.'),
 (89.0, 2.9, 'Office Admin and AIVA.'),
 (92.0, 3.35, 'Run the work. Not the runaround.'),
]

def narration():
    opts=ort.SessionOptions(); opts.intra_op_num_threads=2; opts.inter_op_num_threads=1
    session=ort.InferenceSession('.models/kokoro-v1.0.onnx',sess_options=opts,providers=['CPUExecutionProvider'])
    k=Kokoro.from_session(session,'.models/voices-v1.0.bin'); tok=Tokenizer()
    meta=[]; stem=np.zeros(int(SR*DURATION),dtype=np.float32)
    for i,(start,available,text) in enumerate(CUES):
        # Phonemize ordinary language normally, but hard-code the product's name.
        phones=' ˈeɪvə '.join(tok.phonemize(part,lang='en-us') for part in text.split('AIVA'))
        speed=.98
        for attempt in range(3):
            a,sr=k.create(phones,voice='af_heart',speed=speed,lang='en-us',is_phonemes=True,sentence_pause=.22,clause_pause=.10)
            nz=np.flatnonzero(np.abs(a)>.0025)
            if nz.size: a=a[max(0,nz[0]-int(.055*sr)):min(len(a),nz[-1]+int(.10*sr))]
            dur=len(a)/sr
            if dur<=available: break
            speed=min(1.16,speed*dur/available*1.012)
        if dur>available+.04: raise RuntimeError(f'Cue {i} does not fit: {dur:.2f}s / {available}s')
        a=a.astype(np.float32); a*=min(1,.82/(np.max(np.abs(a))+1e-9))
        # 5-ms fades prevent any hard onset/offset edges.
        n=min(int(sr*.005),len(a)//2); a[:n]*=np.linspace(0,1,n); a[-n:]*=np.linspace(1,0,n)
        sf.write(OUT/f'vo-{i:02d}.wav',a,sr,subtype='PCM_24')
        up=np.interp(np.arange(int(len(a)*SR/sr))*sr/SR,np.arange(len(a)),a).astype(np.float32)
        pos=round(start*SR); stem[pos:pos+len(up)]+=up
        row=dict(index=i,start=start,end=start+dur,duration=dur,available=available,text=text,phonemes=phones,speed=speed,voice='af_heart',file=f'audio/v2/vo-{i:02d}.wav')
        meta.append(row); print(json.dumps(row,ensure_ascii=False),flush=True)
    sf.write(OUT/'narration.wav',stem,SR,subtype='PCM_24')
    Path('production/v2-narration.json').write_text(json.dumps(meta,indent=2,ensure_ascii=False)+'\n')
    # The original name token and the correction are recorded for pronunciation QA.
    (QA/'pronunciation.json').write_text(json.dumps({'name':'AIVA','required':'AY-vuh','ipa':'/ˈeɪvə/','synthesis_token':'ˈeɪvə','engine_default_Ava':tok.phonemize('Ava'),'method':'Explicit phoneme input to Kokoro','cue_indices':[7,11]},indent=2,ensure_ascii=False)+'\n')
    return meta,stem

rng=np.random.default_rng(261014)
def freq(m): return 440*2**((m-69)/12)
def tone(m,d,kind='pluck'):
    t=np.arange(int(SR*d),dtype=np.float64)/SR; f=freq(m)
    if kind=='pluck':
        a=np.sin(2*np.pi*f*t+1.4*np.sin(2*np.pi*f*2*t)*np.exp(-t*12))
        a+=.24*np.sin(2*np.pi*f*2*t)*np.exp(-t*5)+.09*np.sin(2*np.pi*f*3*t)*np.exp(-t*8)
        env=(1-np.exp(-t*220))*np.exp(-t*4.8)*np.minimum(1,(d-t)*24)
    elif kind=='bass':
        a=np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*f*2*t)+.08*np.sin(2*np.pi*f*3*t)
        env=(1-np.exp(-t*110))*np.exp(-t*1.9)*np.minimum(1,(d-t)*25)
    else:
        a=np.sin(2*np.pi*f*t)+.20*np.sin(2*np.pi*f*1.002*t)+.15*np.sin(2*np.pi*f*2*t)
        env=np.minimum(1,t/.32)*np.minimum(1,(d-t)/.6)
    return (a*env).astype(np.float32)
def noise(d,high=True):
    a=rng.normal(0,1,int(SR*d)).astype(np.float32)
    smooth=np.convolve(a,np.ones(15)/15,mode='same')
    return (a-smooth if high else smooth).astype(np.float32)
def percussion(kind):
    d={'kick':.38,'snare':.18,'hat':.07,'open':.21,'tick':.035}[kind]
    t=np.arange(int(SR*d))/SR
    if kind=='kick':
        phase=2*np.pi*(46*t+54*.022*(1-np.exp(-t/.022)))
        a=np.sin(phase)*np.exp(-t*13)+noise(d)*.018*np.exp(-t*160)
    elif kind=='snare':
        a=noise(d)*np.exp(-t*35)*.40+np.sin(2*np.pi*185*t)*np.exp(-t*45)*.18
        # Three tiny transients add a dry handclap texture without a canned sample.
        for off in [0,.007,.014]:
            gate=t>=off; a+=noise(d)*.10*np.exp(-np.maximum(0,t-off)*100)*gate
    else: a=noise(d)*np.exp(-t*({'hat':65,'open':20,'tick':135}[kind]))*.20
    a*=np.minimum(1,t*1000)*np.minimum(1,(d-t)*100)
    return a.astype(np.float32)

def score(meta,voice):
    mix=np.zeros((int(SR*DURATION),2),dtype=np.float32)
    def add(a,start,gain=1.,pan=0.):
        p=round(start*SR); end=min(len(mix),p+len(a));
        if p<0 or end<=p:return
        v=a[:end-p]*gain
        mix[p:end,0]+=v*np.sqrt((1-pan)/2);mix[p:end,1]+=v*np.sqrt((1+pan)/2)
    kit={k:percussion(k) for k in ['kick','snare','hat','open','tick']}
    # 120 BPM; four harmonically voiced bars per 8-second phrase.
    chords=[[50,57,61,64,69],[47,54,57,61,66],[43,50,54,57,62],[45,52,57,59,64]]
    bass=[38,35,31,33]
    for bar in range(48):
        start=bar*2.;ch=chords[bar%4]
        energy=.5 if start<6 else (1.0 if start<58 else (.34 if start<64 else 1.07))
        if start>=82:energy=.78
        if start>=90:energy=.55
        for j,n in enumerate(ch):add(tone(n,3.2,'pad'),start,.018,(-.8+j*.4))
        # Syncopated, evolving pluck figure. The upper note changes each phrase.
        pattern=[(0,ch[2]+12),(.375,ch[4]+12),(.75,ch[3]+12),(1.125,ch[1]+12),(1.5,ch[4]+(12 if bar%8<4 else 14)),(1.75,ch[2]+12)]
        for idx,(offset,n) in enumerate(pattern):
            if start<4 and idx%2:continue
            if 58<=start<64 and idx not in [0,3]:continue
            add(tone(n,.8),start+offset,.055*energy,(-.40 if idx%2 else .40))
            add(tone(n,.8),start+offset+.1875,.010*energy,(.70 if idx%2 else -.70))
        if 6<=start<90:
            for offset,length,g in [(0,.43,.12),(.75,.26,.09),(1.25,.46,.11),(1.875,.20,.065)]:
                if 58<=start<64 and offset!=0:continue
                add(tone(bass[bar%4],length,'bass'),start+offset,g*energy)
        if 6<=start<88 and not 58<=start<64:
            for off in [0,.5,1.,1.5]:add(kit['kick'],start+off,.23*energy)
            for off in [.5,1.5]:add(kit['snare'],start+off,.24*energy,(-.08 if off==.5 else .08))
            for j in range(8):
                off=j*.25 + (.014 if j%2 else 0)
                add(kit['hat'],start+off,(.17 if j%2 else .10)*energy,.45 if j%2 else -.35)
            if bar%4==3:add(kit['open'],start+1.75,.10,-.3)
            if bar%8==7:
                for off in [1.625,1.75,1.875]:add(kit['tick'],start+off,.19,off-1.75)
        elif 4<=start<90:
            for off in [0,.75,1.5]:add(kit['tick'],start+off,.14,.4)
    # Soft musical punctuation and precisely timed scene-transition air.
    for at in [6,14,24,34,42,50,58,64,74,82,88]:
        d=.55;a=noise(d,high=False);tt=np.arange(len(a))/SR
        env=np.sin(np.pi*tt/d)**2
        add(a*env,at-.33,.18,-.15);add(kit['tick'],at,.15,.15)
    for off,n in [(0,74),(.25,78),(.5,81)]:add(tone(n,2.1),88+off,.08,off-.25)
    for n in [50,57,62,66,69,76]:add(tone(n,6.,'pad'),90,.033,(n%5-2)*.25)
    # Smooth voice-aware ducking; never cut the score at phrase boundaries.
    duck=np.ones(len(mix),dtype=np.float32)
    for c in meta:
        a=max(0,round((c['start']-.20)*SR));b=round(c['start']*SR)
        e=round(c['end']*SR);z=min(len(mix),e+round(.42*SR))
        duck[a:b]=np.minimum(duck[a:b],np.linspace(1,.42,b-a));duck[b:e]=np.minimum(duck[b:e],.42)
        duck[e:z]=np.minimum(duck[e:z],np.linspace(.42,1,z-e))
    ramp=np.minimum(1,np.arange(len(mix))/(SR*.4));tail=np.minimum(1,(len(mix)-np.arange(len(mix)))/(SR*1.2))
    mix*=ramp[:,None]*tail[:,None]
    sf.write(OUT/'music-and-sound.wav',mix,SR,subtype='PCM_24')
    master=mix*duck[:,None]+voice[:,None]*.96
    peak=float(np.max(np.abs(master)))
    if peak>.90:master*=.90/peak
    sf.write(OUT/'premaster.wav',master,SR,subtype='PCM_24')
    (QA/'sound-design.json').write_text(json.dumps({'duration':DURATION,'sample_rate':SR,'tempo':120,'seed':261014,'stereo':True,'music':'Original synthesis, no recorded samples','narration_words':sum(len(c['text'].split()) for c in meta),'speech_seconds':sum(c['duration'] for c in meta),'pre_master_peak':peak},indent=2)+'\n')

def captions(meta):
    def ts(s,sep=','):
        ms=round(s*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}{sep}{ms%1000:03}'
    srt=[];vtt=['WEBVTT\n']
    for i,c in enumerate(meta):
        txt=c['text'].replace('Office Admin','OfficeAdmin')
        srt.append(f"{i+1}\n{ts(c['start'])} --> {ts(c['end'])}\n{txt}\n")
        vtt.append(f"{ts(c['start'],'.')} --> {ts(c['end'],'.')}\n{txt}\n")
    Path('production/v2-captions.srt').write_text('\n'.join(srt)+'\n')
    Path('production/v2-captions.vtt').write_text('\n'.join(vtt)+'\n')

if __name__=='__main__':
    import sys
    if '--score-only' in sys.argv:
        meta=json.loads(Path('production/v2-narration.json').read_text());voice,sr=sf.read(OUT/'narration.wav',dtype='float32');assert sr==SR
    else: meta,voice=narration()
    score(meta,voice);captions(meta)
    print('V2 AUDIO COMPLETE',flush=True)
