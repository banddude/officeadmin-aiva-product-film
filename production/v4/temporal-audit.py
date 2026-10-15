"""Flag single-frame visual impulses in the actual exported movies for review.
This is a targeted diagnostic, not a proof that a film has no subjective defects.
"""
from pathlib import Path
import json,subprocess,hashlib
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[2];QA=ROOT/'qa/v4';OUT=ROOT/'out/v4'
DELIVERIES=[('landscape','OfficeAdmin_AIVA_V4_Contractor_Story_Film.mp4'),('portrait','OfficeAdmin_AIVA_V4_Contractor_Story_Vertical.mp4')]
TIMES=[2.5,8.3,11.5,16.5,22.8,28.5,35.5,41.0,47.8,53.3,56.0,57.3,58.4,59.5,60.8,64.5,68.2,70.8,74.3,78.5,82.0,85.4,87.13,89.0]
results=[]
for kind,name in DELIVERIES:
    movie=OUT/name
    raw=subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(movie),'-vf','scale=160:90','-pix_fmt','gray','-f','rawvideo','-'],check=True,capture_output=True).stdout
    frames=np.frombuffer(raw,dtype=np.uint8).reshape(-1,90,160).astype('float32')/255
    assert len(frames)==2700
    d=np.mean(np.abs(np.diff(frames,axis=0)),axis=(1,2))
    neighbor=np.mean(np.abs(frames[2:]-frames[:-2]),axis=(1,2))
    impulse=np.minimum(d[:-1],d[1:])-neighbor*.5
    candidates=np.where((impulse>.012)&(neighbor<.014)&(np.minimum(d[:-1],d[1:])>.018))[0]+1
    # Preserve raw candidate values. A human/vision review must decide whether
    # a candidate is an artifact or a deliberate transition.
    rows=[{'frame':int(i),'seconds':float(i/30),'previousDifference':float(d[i-1]),'nextDifference':float(d[i]),'neighborDifference':float(neighbor[i-1]),'impulse':float(impulse[i-1])} for i in candidates]
    def still(frame,path):
        subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{frame/30:.9f}','-i',str(movie),'-frames:v','1','-q:v','2',str(path)],check=True)
    w,h=(480,270) if kind=='landscape' else (270,480)
    sheet=Image.new('RGB',(w*4,(h+24)*6),'#e1e6ea');draw=ImageDraw.Draw(sheet)
    for i,t in enumerate(TIMES):
        frame=round(t*30);file=QA/f'verified-{kind}-{frame:04}.jpg';still(frame,file)
        im=Image.open(file).convert('RGB');im.thumbnail((w,h));x=i%4*w;y=i//4*(h+24);sheet.paste(im,(x,y+24));draw.text((x+8,y+5),f'{frame/30:.2f}s | {frame}',fill='#1f2933')
    contact=QA/f'OfficeAdmin_AIVA_V4_Review_{kind}.jpg';sheet.save(contact,quality=94)
    for row in rows:
        for frame in range(max(0,row['frame']-1),min(2700,row['frame']+2)):
            still(frame,QA/f'impulse-{kind}-{frame:04}.jpg')
    results.append({'kind':kind,'sha256':hashlib.sha256(movie.read_bytes()).hexdigest(),'framesChecked':len(frames),'sampleSize':[160,90],'candidates':rows,'minimumMeanLuma':float(frames.mean(axis=(1,2)).min()),'maximumFrameDifference':float(d.max()),'contactSheet':contact.name,'timesSeconds':TIMES})
(QA/'temporal-audit.json').write_text(json.dumps({'method':'Downsampled single-frame temporal impulse diagnostic plus delivered-frame sheets','automaticPass':all(not r['candidates'] for r in results),'requiresVisualReview':True,'deliveries':results},indent=2)+'\n')
print(json.dumps(results,indent=2),flush=True)
