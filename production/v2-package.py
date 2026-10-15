"""Package the finished delivery without fonts, models or application code."""
from pathlib import Path
import hashlib, json, shutil, subprocess, zipfile
from PIL import Image, ImageDraw
ROOT=Path('.');OUT=ROOT/'out/v2';QA=ROOT/'qa/v2';OUT.mkdir(parents=True,exist_ok=True)

def stems():
    target=OUT/'OfficeAdmin_AIVA_V2_Audio_Stems.zip'
    files=list((ROOT/'public/audio/v2').glob('*.wav'))
    files += [ROOT/p for p in ['production/v2-audio.py','production/v2-narration.json','production/v2-captions.srt','production/v2-captions.vtt','production/master-audio.py','production/audio-requirements.txt','NOTICE.md','production/v2-production-notes.md']]
    assert len(list((ROOT/'public/audio/v2').glob('vo-*.wav')))==13
    with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=2) as z:
        for f in files:z.write(f,str(f))
    with zipfile.ZipFile(target) as z:assert not any(n.endswith(('.woff','.woff2','.ttf','.otf','.onnx','.bin')) for n in z.namelist())
    print('STEMS',target,target.stat().st_size,flush=True)

def video_review():
    frames=[75,300,555,840,1140,1395,1635,1845,2100,2340,2565,2775]
    for kind,filename,size in [('landscape','OfficeAdmin_AIVA_V2_Film.mp4',(640,360)),('portrait','OfficeAdmin_AIVA_V2_Vertical.mp4',(270,480))]:
        movie=OUT/filename
        if not movie.exists():continue
        w,h=size;sheet=Image.new('RGB',(w*3,(h+25)*4),'#dde0e3');draw=ImageDraw.Draw(sheet)
        for i,f in enumerate(frames):
            still=QA/f'delivery-{kind}-{f:04}.jpg'
            subprocess.run(['ffmpeg','-v','error','-y','-ss',str(f/30),'-i',str(movie),'-frames:v','1','-q:v','2',str(still)],check=True)
            im=Image.open(still).convert('RGB');im.thumbnail((w,h));x=i%3*w;y=i//3*(h+25)
            sheet.paste(im,(x,y+25));draw.text((x+8,y+6),f'{f/30:.1f}s',fill='#33383e')
        sheet.save(QA/f'OfficeAdmin_AIVA_V2_Review_{kind}.jpg',quality=94)
        poster=QA/f'delivery-{kind}-2775.jpg'
        shutil.copy2(poster,QA/('OfficeAdmin_AIVA_V2_Poster.jpg' if kind=='landscape' else 'OfficeAdmin_AIVA_V2_Poster_Vertical.jpg'))
        print('VIDEO REVIEW',kind,flush=True)
    shutil.copy2(ROOT/'production/v2-captions.srt',OUT/'OfficeAdmin_AIVA_V2.srt')
    shutil.copy2(ROOT/'production/v2-captions.vtt',OUT/'OfficeAdmin_AIVA_V2.vtt')

def checksums():
    items={}
    for f in sorted(OUT.iterdir()):
        if f.is_file() and f.suffix in ['.mp4','.zip','.srt','.vtt']:
            with f.open('rb') as h:digest=hashlib.file_digest(h,'sha256').hexdigest()
            items[f.name]={'bytes':f.stat().st_size,'sha256':digest}
    (OUT/'SHA256SUMS.txt').write_text(''.join(f"{v['sha256']}  {k}\n" for k,v in items.items()))
    (QA/'release-assets.json').write_text(json.dumps(items,indent=2)+'\n')
    print(json.dumps(items,indent=2),flush=True)

if __name__=='__main__':
    import sys
    if '--stems' in sys.argv:stems()
    elif '--review' in sys.argv:video_review();checksums()
    else:stems();video_review();checksums()
