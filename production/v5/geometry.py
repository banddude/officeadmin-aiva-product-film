"""Extract V5 snapshot geometry (fragment sizes + target rects) for scene layout. Data only, no rendering."""
import json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2];out={}
for f in sorted((ROOT/'public/ui-dom-v5').glob('*.json')):
    try:d=json.loads(f.read_text())
    except Exception as e: print('SKIP',f.name,e);continue
    out[f.stem]={'w':d['width'],'h':d['height'],'frags':{k:[round(v['width'],1),round(v['height'],1)] for k,v in d['fragments'].items()},
     'targets':{t['id']:[round(t['rect']['x'],1),round(t['rect']['y'],1),round(t['rect']['width'],1),round(t['rect']['height'],1),t['kind'],t['text'][:60]] for t in d['targets']}}
(ROOT/'src/v5/geometry.json').write_text(json.dumps(out,separators=(',',':'))+'\n');print(len(out),'snapshots')
