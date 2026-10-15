"""Produce typed geometry and checksum records for the isolated V4 captures."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[2];out={};registry=[]
for file in sorted((ROOT/'public/ui-dom-v4').glob('*.json')):
    data=json.loads(file.read_text())
    out[file.stem]={'width':data['width'],'height':data['height'],'targets':{t['id']:{'kind':t['kind'],'text':t['text'],**t['rect']} for t in data['targets']},'fragments':{k:{'width':v['width'],'height':v['height']} for k,v in data['fragments'].items()}}
    registry.append({'name':file.stem,'file':str(file.relative_to(ROOT)),'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'bytes':file.stat().st_size})
(ROOT/'src/v4-geometry.ts').write_text('export const geometry = '+json.dumps(out,indent=2)+';\n')
(ROOT/'qa/v4/dom-registry.json').write_text(json.dumps({'fictionalData':True,'realUI':True,'snapshots':registry},indent=2)+'\n')
print('V4 geometry:',','.join(out))
