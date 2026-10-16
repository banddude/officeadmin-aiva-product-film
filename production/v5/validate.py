"""Validate a finished V5 MP4 (decode/inspect only) and build a 24-frame contact sheet from the FINAL file.
Usage: python3 production/v5/validate.py <mp4> landscape|portrait"""
import json,subprocess,sys,hashlib,pathlib
mp4,kind=sys.argv[1],sys.argv[2];ROOT=pathlib.Path(__file__).resolve().parents[2]
TL=json.loads((ROOT/'production/v5/timeline.json').read_text());W,H=(1080,1920) if kind=='portrait' else (1920,1080);N=round(TL['duration']*30)
def run(*a):return subprocess.run(a,capture_output=True,text=True,check=True).stdout
p=json.loads(run('ffprobe','-v','error','-show_streams','-show_format','-of','json',mp4))
v=[s for s in p['streams'] if s['codec_type']=='video'][0];a=[s for s in p['streams'] if s['codec_type']=='audio'][0]
checks={
 'size':(v['width'],v['height'])==(W,H),'frames':int(v['nb_frames'])==N,'fps':v['r_frame_rate']=='30/1',
 'duration':abs(float(p['format']['duration'])-TL['duration'])<.05,'codec':v['codec_name']=='h264','pix_fmt':v['pix_fmt']=='yuv420p',
 'bt709':v.get('color_space')=='bt709' and v.get('color_primaries')=='bt709' and v.get('color_transfer')=='bt709','tv_range':v.get('color_range')=='tv',
 'audio':a['codec_name']=='aac' and a['sample_rate']=='48000' and int(a['channels'])==2,
}
head=open(mp4,'rb').read(4096);checks['faststart']=head.find(b'moov')!=-1 and (head.find(b'mdat')==-1 or head.find(b'moov')<head.find(b'mdat'))
dec=subprocess.run(['ffmpeg','-v','error','-i',mp4,'-f','null','-'],capture_output=True,text=True);checks['decodes_clean']=dec.returncode==0 and not dec.stderr.strip()
def amd5(f):return run('ffmpeg','-v','error','-i',f,'-map','0:a:0','-c','copy','-f','md5','-').strip()
checks['audio_is_master']=amd5(mp4)==amd5(str(ROOT/'public/audio/v5/master.m4a'))
# 24 frames spread across the film, decoded from the final MP4
out=ROOT/'qa/v5'/f'final-{kind}';out.mkdir(parents=True,exist_ok=True)
times=[round(.5+i*(TL['duration']-1.2)/23,2) for i in range(24)]
for i,t in enumerate(times):subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',mp4,'-frames:v','1',str(out/f'{i:02}-{t:06.2f}.png')],check=True)
cols,w=(6,400) if kind=='landscape' else (8,270)
files=sorted(out.glob('*.png'));inputs=sum([['-i',str(f)] for f in files],[])
flt=''.join(f"[{i}]scale={w}:-1,drawtext=text='{f.stem.split('-')[1]}s':x=6:y=6:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.6[v{i}];" for i,f in enumerate(files))
flt+=''.join(f'[v{i}]' for i in range(len(files)))+f'xstack=inputs={len(files)}:grid={cols}x{len(files)//cols}'
sheet=ROOT/'qa/v5'/f'final-{kind}-contact-sheet.jpg';subprocess.run(['ffmpeg','-v','error','-y',*inputs,'-filter_complex',flt,'-q:v','3',str(sheet)],check=True)
res={'file':mp4,'kind':kind,'sha256':hashlib.sha256(open(mp4,'rb').read()).hexdigest(),'bytes':pathlib.Path(mp4).stat().st_size,'checks':checks,'all_pass':all(checks.values()),'contact_sheet':str(sheet),'frame_times':times}
(ROOT/'qa/v5'/f'validate-{kind}.json').write_text(json.dumps(res,indent=1)+'\n');print(json.dumps(res,indent=1))
