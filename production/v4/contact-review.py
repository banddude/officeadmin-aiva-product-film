"""Make visual QA contact sheets from actual rendered film frames."""
from pathlib import Path
import sys,math
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[2];QA=ROOT/'qa/v4'
frames=[int(x) for x in sys.argv[1].split(',')] if len(sys.argv)>1 else [140,340,500,685,850,1030,1180,1440,1590,1720,1752,1970,2220,2390,2640]
for kind,wh in [('landscape',(480,270)),('portrait',(270,480))]:
    w,h=wh;sheet=Image.new('RGB',(3*w,(h+25)*math.ceil(len(frames)/3)),'#dfe4e7');draw=ImageDraw.Draw(sheet)
    for i,frame in enumerate(frames):
        file=QA/f'{kind}-{frame:04}.png'
        im=Image.open(file).convert('RGB');im.thumbnail(wh)
        x=i%3*w;y=i//3*(h+25);sheet.paste(im,(x,y+25));draw.text((x+8,y+6),f'{frame/30:.2f}s | {frame}',fill='#202832')
    file=QA/f'final-source-review-{kind}.jpg';sheet.save(file,quality=94);print(file)
