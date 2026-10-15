"""Verify both V3 exports by full decode, metadata, soundtrack identity and loudness."""
from pathlib import Path
import hashlib,json,re,struct,subprocess
ROOT=Path(__file__).resolve().parents[2];QA=ROOT/'qa/v3';OUT=ROOT/'out/v3'
def run(args,timeout=180):
 return subprocess.run(args,check=True,stdin=subprocess.DEVNULL,capture_output=True,text=True,timeout=timeout)
def audio_hash(file):
 return run(['ffmpeg','-v','error','-i',str(file),'-map','0:a:0','-c:a','copy','-f','hash','-hash','sha256','-']).stdout.strip()
def atoms(file):
 out=[]
 with file.open('rb') as h:
  total=file.stat().st_size
  while h.tell()+8<=total:
   start=h.tell();size,kind=struct.unpack('>I4s',h.read(8))
   if size==1:size=struct.unpack('>Q',h.read(8))[0]
   if size==0:size=total-start
   if size<8 or start+size>total:raise ValueError('Invalid MP4 atom')
   out.append(kind.decode('ascii'));h.seek(start+size)
 return out

def main():
 original=audio_hash(ROOT/'public/audio/v3/master.m4a');results=[]
 for kind,name,w,h in [('landscape','OfficeAdmin_AIVA_V3_Motion_Film.mp4',1920,1080),('portrait','OfficeAdmin_AIVA_V3_Motion_Vertical.mp4',1080,1920)]:
  file=OUT/name
  p=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(file)]).stdout)
  v=next(x for x in p['streams'] if x['codec_type']=='video');a=next(x for x in p['streams'] if x['codec_type']=='audio')
  assert v['codec_name']=='h264' and v['pix_fmt']=='yuv420p'
  assert (v['width'],v['height'])==(w,h)
  assert v['avg_frame_rate']=='30/1' and int(v['nb_frames'])==2700
  assert all(v[k]=='bt709' for k in ['color_space','color_primaries','color_transfer'])
  assert v['color_range']=='tv'
  assert a['codec_name']=='aac' and a['channels']==2 and int(a['sample_rate'])==48000
  assert abs(float(p['format']['duration'])-90)<.05 and abs(float(a['duration'])-90)<.05
  decoded=run(['ffmpeg','-v','error','-threads','2','-i',str(file),'-f','null','-'])
  assert not decoded.stderr.strip(),decoded.stderr
  digest=audio_hash(file);assert digest==original,'Wrong or modified soundtrack'
  order=atoms(file);assert order.index('moov')<order.index('mdat'),'Not fast-start'
  measured=run(['ffmpeg','-hide_banner','-nostats','-i',str(file),'-vn','-af','loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json','-f','null','-'])
  level=json.loads(re.findall(r'\{\s*"input_i".*?\}',measured.stderr,re.S)[-1])
  assert -16.8<float(level['input_i'])<-15.2
  assert float(level['input_tp'])<=-1.0
  checksum=hashlib.sha256(file.read_bytes()).hexdigest()
  row={'kind':kind,'filename':name,'passed':True,'width':w,'height':h,'frames':2700,'fps':30,'durationSeconds':90,'fullDecodeErrors':0,'audioMatchesMaster':True,'audioPacketSha256':digest,'integratedLufs':float(level['input_i']),'truePeakDbtp':float(level['input_tp']),'fastStart':True,'bytes':file.stat().st_size,'sha256':checksum}
  results.append(row);print(json.dumps(row),flush=True)
 QA.mkdir(parents=True,exist_ok=True);(QA/'final-delivery-validation.json').write_text(json.dumps({'passed':True,'deliveries':results},indent=2)+'\n')
 print('BOTH V3 DELIVERIES PASSED',flush=True)
if __name__=='__main__':main()
