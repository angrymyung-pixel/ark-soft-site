"""Build only due episodes. Run on GitHub, with EDITION_KEY from repository secrets."""
import argparse,base64,json,os,shutil
from pathlib import Path
from datetime import datetime,timezone
from nacl.secret import SecretBox
ROOT=Path(__file__).resolve().parents[1]
def build(now,out):
    if out.exists(): shutil.rmtree(out)
    out.mkdir(parents=True)
    for p in ROOT.iterdir():
        if p.name.startswith('.') or p.name in {'scripts','site-output','tests','desktop.ini','release-plan.json'}:continue
        if p.is_file() and p.suffix in {'.html','.css','.js','.png','.jpeg','.jpg','.webp','.ico','.txt'}:shutil.copy2(p,out/p.name)
        elif p.is_dir() and p.name in {'assets','media'}:shutil.copytree(p,out/p.name,ignore=shutil.ignore_patterns('desktop.ini','Thumbs.db'))
    plan=json.loads((ROOT/'release-plan.json').read_text(encoding='utf-8'))
    (out/'release-plan.json').write_text(json.dumps(plan,ensure_ascii=False),encoding='utf-8')
    key=base64.b64decode(os.environ['EDITION_KEY'],validate=True)
    edition=json.loads(SecretBox(key).decrypt((ROOT/'.release/edition.enc').read_bytes()))
    published=[];dest=out/'published';dest.mkdir()
    for e in edition:
        if e['ready'] and datetime.fromisoformat(e['releaseAt'])<=now:
            if not e['html'].strip():raise ValueError('Empty manuscript')
            payload={k:e[k] for k in ['id','title','releaseAt','html']}
            (dest/(e['id']+'.json')).write_text(json.dumps(payload,ensure_ascii=False),encoding='utf-8')
            published.append({k:e[k] for k in ['id','title','releaseAt']})
    (dest/'catalog.json').write_text(json.dumps({'episodes':published},ensure_ascii=False),encoding='utf-8')
    (out/'.nojekyll').touch()
    return published
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--now');parser.add_argument('--out',default='site-output');args=parser.parse_args()
    now=datetime.fromisoformat(args.now) if args.now else datetime.now(timezone.utc)
    if now.tzinfo is None:raise ValueError('Timezone required')
    result=build(now,ROOT/args.out);print('Published episodes:',len(result))
