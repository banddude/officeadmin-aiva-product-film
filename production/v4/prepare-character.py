"""Separate official AIVA pupils and glasses without drawing a replacement mark."""
from pathlib import Path
import hashlib, json
import numpy as np
from PIL import Image
from scipy.ndimage import label
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'public/brand';OUT=SRC/'v4';OUT.mkdir(exist_ok=True)
a=np.array(Image.open(SRC/'aiva-mask-robot.png').convert('RGBA'))[:,:,3]
components,count=label(a>0)
def tinted(alpha,color):
    im=Image.new('RGBA',(1254,1254),color)
    im.putalpha(Image.fromarray(alpha.astype('uint8'),'L'))
    return im
# Connected components 3/4 are the two existing square pupils. Verify locations.
for number,expected in [(3,(431,700,521,790)),(4,(728,700,819,790))]:
    component=np.where(components==number,a,0).astype('uint8')
    assert Image.fromarray(component).getbbox()==expected
    tinted(component,'#a3a3a3').save(OUT/('eye-left.png' if number==3 else 'eye-right.png'))
base=np.where((components==3)|(components==4),0,a).astype('uint8')
tinted(base,'#a3a3a3').save(OUT/'body.png')
glasses=Image.new('RGBA',(1254,1254))
for name,color in [('aiva-mask-o.png','#fafafa'),('aiva-mask-a.png','#3ba4e0')]:
    alpha=np.array(Image.open(SRC/name).convert('RGBA'))[:,:,3]
    glasses=Image.alpha_composite(glasses,tinted(alpha,color))
glasses.save(OUT/'glasses.png')
white=Image.new('RGBA',glasses.size,'white');white.putalpha(glasses.getchannel('A'));white.save(OUT/'glasses-highlight.png')
complete=Image.open(OUT/'body.png').convert('RGBA')
for name in ['eye-left.png','eye-right.png','glasses.png']:
    complete=Image.alpha_composite(complete,Image.open(OUT/name).convert('RGBA'))
complete.save(OUT/'complete.png')
ref=np.array(Image.open(SRC/'aiva-dark-complete.png').convert('RGBA')).astype('int16')
actual=np.array(complete).astype('int16');visible=np.maximum(ref[:,:,3],actual[:,:,3])>0
delta=np.abs(actual-ref)[visible];maxdiff=int(delta.max())
assert maxdiff<=1, f'Official mark mismatch: {maxdiff}'
record={'source':'Official application masks, no newly drawn geometry','canvas':[1254,1254], 'staticCompositeMatchesOfficialWithin':maxdiff, 'pupilOrigins':[[476/1254,745/1254],[773.5/1254,745/1254]],'files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in OUT.glob('*.png')}}
(ROOT/'qa/v4/character-provenance.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record,indent=2))
