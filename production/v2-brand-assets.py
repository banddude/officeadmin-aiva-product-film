"""Prepare deterministic, faithful render assets from the application's own PNGs.
No logo is redrawn. OA trimming removes only transparent canvas. AIVA's three
source alpha masks are composited with the exact AivaChatAvatar theme colors.
"""
from pathlib import Path
from PIL import Image
import hashlib, json
root=Path('public/brand')
meta={'method':'Original app PNGs; trim transparency only; exact source alpha-mask compositing','source_component':'components/messages/aiva-chat-avatar.tsx','assets':[]}
for theme in ['light','dark']:
    src=root/f'logo-{theme}.png';im=Image.open(src).convert('RGBA');box=im.getbbox();out=root/f'oa-{theme}-trim.png';im.crop(box).save(out)
    meta['assets'].append({'output':str(out),'source':str(src),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'transparent_bbox':box})
    output=Image.new('RGBA',(1254,1254),(0,0,0,0))
    for name,color in [('robot','#737373' if theme=='light' else '#a3a3a3'),('o','#0a0a0a' if theme=='light' else '#fafafa'),('a','#3BA4E0')]:
        source=root/f'aiva-mask-{name}.png';mask=Image.open(source).convert('RGBA')
        layer=Image.new('RGBA',mask.size,color);layer.putalpha(mask.getchannel('A'));output=Image.alpha_composite(output,layer)
        meta['assets'].append({'theme':theme,'source':str(source),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'color':color})
    output.save(root/f'aiva-{theme}-complete.png')
Path('production/v2-brand-provenance.json').write_text(json.dumps(meta,indent=2)+'\n')
print('Official complete brand assets ready')
