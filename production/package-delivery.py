"""Validate the rendered film and package a reproducible, font-free handoff."""
from pathlib import Path
import hashlib, json, shutil, subprocess, zipfile
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
movie = root / 'out/officeadmin-aiva-film.mp4'
qa = root / 'qa'
probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)]))
video = next(s for s in probe['streams'] if s['codec_type']=='video')
audio = next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (video['width'], video['height'], video['r_frame_rate']) == (1920,1080,'30/1')
assert int(video['nb_frames']) == 3360
assert video['codec_name']=='h264' and video['pix_fmt']=='yuv420p'
assert video['color_range']=='tv' and video['color_space']=='bt709'
assert audio['codec_name']=='aac' and audio['channels']==2 and audio['sample_rate']=='48000'
assert abs(float(probe['format']['duration'])-112)<0.05
result = subprocess.run(['ffmpeg','-v','error','-i',str(movie),'-map','0:v:0','-map','0:a:0','-f','null','-'],capture_output=True,text=True)
(qa/'full-decode.log').write_text(result.stderr)
assert result.returncode==0 and not result.stderr.strip(), result.stderr
subprocess.run(['ffmpeg','-hide_banner','-i',str(movie),'-vn','-af','ebur128=peak=true','-f','null','-'],stdout=subprocess.DEVNULL,stderr=(qa/'final-audio-loudness.log').open('w'),check=True)

shots=[(1.8,'One business'),(4.33,'The moving parts'),(9.87,'OfficeAdmin'),(13.43,'The workspace'),(20.83,'One job. Every detail.'),(31.37,'From plans to pricing'),(36.33,'Send the estimate'),(39.23,'Customer approval'),(41.67,'Accepted work'),(50.13,'Built for the field'),(59.87,'See the whole picture'),(66.67,'Meet AIVA'),(77.57,'More than a transcript'),(87.33,'Context. Then action.'),(95.4,'Working together'),(102.8,'More building'),(108.83,'Run the work. Not the runaround.')]
width,height=640,360
sheet=Image.new('RGB',(width*3,(height+40)*6),(228,231,236))
draw=ImageDraw.Draw(sheet)
try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
except OSError: font=ImageFont.load_default()
for index,(seconds,label) in enumerate(shots):
    target=qa/f'delivery-frame-{index:02}.jpg'
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(seconds),'-i',str(movie),'-frames:v','1','-vf',f'scale={width}:{height}','-q:v','2',str(target)],check=True)
    x=(index%3)*width;y=(index//3)*(height+40)
    with Image.open(target) as image:sheet.paste(image,(x,y))
    timestamp=f'{int(seconds)//60:02}:{int(seconds)%60:02}'
    draw.text((x+14,y+height+11),timestamp+'  '+label,font=font,fill=(25,32,42))
poster=qa/'OfficeAdmin_AIVA_Poster.jpg'
subprocess.run(['ffmpeg','-v','error','-y','-ss','108.83','-i',str(movie),'-frames:v','1','-q:v','2',str(poster)],check=True)
board=qa/'OfficeAdmin_AIVA_Storyboard.jpg'
sheet.save(board,quality=92)

stage=Path('/tmp/aiva-chatgpt-transfer')
destination=Path('/home/ubuntu/mikeshaffer/work/officeadmin-product-film-20261014')
stage.mkdir(exist_ok=True);destination.mkdir(parents=True,exist_ok=True)
summary={'status':'passed','duration_seconds':112,'resolution':'1920x1080','fps':30,'frames':3360,'video':'H.264 / yuv420p / Rec.709 / limited range','audio':'AAC / stereo / 48000 Hz','full_decode_errors':0,'visual_review_samples':len(shots),'synthetic_narration':True,'fictional_demo_data':True,'illustrative_interfaces':True,'live_customer_actions_performed':False}
(qa/'delivery-validation.json').write_text(json.dumps(summary,indent=2)+'\n')
(root/'production/officeadmin-aiva-script.txt').write_text('\n\n'.join(f"{int(x['start'])//60:02}:{int(x['start'])%60:02}  "+x['text'].replace('Office Admin','OfficeAdmin').replace('Ava','AIVA') for x in json.loads((root/'production/narration.json').read_text()))+'\n')
files=[]
for relative in ['README.md','package.json','package-lock.json','tsconfig.json']:
    files.append(root/relative)
for folder in ['src','scripts','public/brand','production']:
    files.extend(p for p in (root/folder).rglob('*') if p.is_file() and p.name not in ['smoke.tsx','font.css','narration-first-pass.py'])
files.extend(p for p in (root/'public/audio').glob('*.wav') if p.name!='master-premaster.wav')
for relative in ['qa/source-validation.json','qa/audio-metrics.json','qa/final-media-probe.json','qa/delivery-validation.json','qa/full-decode.log','qa/final-audio-loudness.log','qa/typecheck.log','qa/OfficeAdmin_AIVA_Storyboard.jpg','qa/OfficeAdmin_AIVA_Poster.jpg']:
    p=root/relative
    if p.exists(): files.append(p)
archive=stage/'OfficeAdmin_AIVA_Remotion_Source.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in sorted(set(files)):
        assert p.suffix.lower() not in {'.woff','.woff2','.ttf','.otf','.eot','.ttc'}
        z.write(p,Path('officeadmin-aiva-film')/p.relative_to(root))
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert not any(Path(n).suffix.lower() in {'.woff','.woff2','.ttf','.otf','.eot','.ttc'} for n in z.namelist())
    for required in ['src/index.tsx','public/audio/master.wav','package-lock.json','production/product-capability-map.md']:
        assert 'officeadmin-aiva-film/'+required in z.namelist()

deliveries=[(movie,'OfficeAdmin_AIVA_Product_Film.mp4'),(board,board.name),(poster,poster.name),(root/'production/officeadmin-aiva-captions.srt','OfficeAdmin_AIVA_Captions.srt'),(root/'production/product-capability-map.md','OfficeAdmin_AIVA_Product_Research.md')]
manifest=[]
for source,name in deliveries:
    out=stage/name;shutil.copy2(source,out);shutil.copy2(out,destination/name)
    manifest.append({'file':name,'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()})
shutil.copy2(archive,destination/archive.name)
manifest.append({'file':archive.name,'bytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest()})
(stage/'OfficeAdmin_AIVA_Delivery_Manifest.json').write_text(json.dumps({'validation':summary,'files':manifest},indent=2)+'\n')
shutil.copy2(stage/'OfficeAdmin_AIVA_Delivery_Manifest.json',destination/'OfficeAdmin_AIVA_Delivery_Manifest.json')
print(json.dumps({'validation':summary,'destination':str(destination),'files':manifest},indent=2),flush=True)
