"""Archive only the reviewed Sept 4 sources; no deployment or live data access."""
from pathlib import Path
import hashlib, json, shutil, subprocess

root = Path(__file__).resolve().parents[1]
out = root / 'checkpoints/2026-09-04-passed'
records = []

def git(repo, *args):
    return subprocess.check_output(['git', '-C', str(repo), *args]).decode('utf-8').strip()

def copy(source, relative):
    target = out / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    raw = source.read_bytes()
    if target.exists() and target.read_bytes() != raw:
        raise RuntimeError('Refusing to replace a different checkpoint file: '+str(target))
    target.write_bytes(raw)
    records.append({'path':str(relative).replace('\\','/'),'source':str(source.relative_to(root)).replace('\\','/'),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})

portal = root / 'work/portal-production-20260904'
flower = root / 'work/flower-production-20260904'
# Tracked portal source only. Environment files, deployment binding, database contents,
# generated deploy packages, and private receipt URLs are intentionally not packaged.
for name in git(portal,'ls-files').splitlines():
    if name.startswith('.openai/') or Path(name).name.startswith('.env'):
        continue
    copy(portal/name, Path('work/portal-production-20260904')/name)

# Flower core source snapshot plus patch against its recorded checkout base.
# Unchanged images/documents remain in the original repository at that base commit.
for source in sorted(flower.iterdir()):
    if source.is_file() and source.suffix.lower() in {'.html','.js','.css','.json','.cjs'}:
        copy(source, Path('work/flower-production-20260904')/source.name)
for source in sorted((flower/'tests').rglob('*')):
    if source.is_file() and source.suffix in {'.cjs','.mjs','.js'}:
        copy(source,Path('work/flower-production-20260904')/source.relative_to(flower))
patch = subprocess.check_output(['git','-C',str(flower),'diff','--binary','HEAD','--','index.html','script.js'])
(out/'flower-changes-from-checkout.patch').write_bytes(patch)

trees = [
 'outputs/event-reservation-test/passed-v1',
 'outputs/event-reservation-flow-test/passed-v2',
 'work/portal-production-20260904/outputs/event-signup-preview',
 'work/portal-production-20260904/outputs/upcoming-preview',
]
for tree in trees:
    for source in sorted((root/tree).rglob('*')):
        if source.is_file() and source.suffix.lower() in {'.gs','.html','.mjs','.cjs','.json','.py','.jpg','.png'}:
            copy(source,source.relative_to(root))
# Active flow test source kept alongside the frozen copy for its relative test paths.
for name in ['Code.gs','Flow.gs','ui.html','build.cjs','verify.cjs','google-initial-readback.json','google-final-readback.json']:
    source=root/'outputs/event-reservation-flow-test'/name
    copy(source,source.relative_to(root))
for name in ['Code.gs','google-readback.json','live-test-evidence.json']:
    source=root/'outputs/event-reservation-test'/name
    copy(source,source.relative_to(root))
for name in ['index.html','verify-return.mjs','build-preview.mjs','serve-preview.py']:
    source=root/'outputs/portal-return-preview'/name
    copy(source,source.relative_to(root))

manifest={
 'checkpoint':'2026-09-04-passed','branch':'codex/checkpoint-2026-09-04-passed',
 'root_parent':git(root,'rev-parse','HEAD'),
 'main_refs':{'root':git(root,'rev-parse','main'),'portal':git(portal,'rev-parse','main'),'flower_checkout':git(flower,'rev-parse','main')},
 'portal_source_head':git(portal,'rev-parse','HEAD'),
 'flower_checkout_base':git(flower,'rev-parse','HEAD'),
 'flower_last_published_commit_from_verified_work_log':'b44bd7db89e4419d854e0b1e245003ccaaaf7c21',
 'production_portal':'https://suiyoukai-portal.c84s4n967v.chatgpt.site/',
 'production_flower':'https://jfsxxxib-wq.github.io/suiyoukai-stamp-app/',
 'test_deployment_version':2,'test_event_status':'締切','test_signup_status':'キャンセル',
 'excluded':['credentials and .env','deployment binding .openai/hosting.json','live ledger data','individual receipt QR codes and secret URLs','node_modules','generated deployment packages','unrelated older changes'],
 'files':records,
}
(out/'MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'files':len(records),'bytes':sum(r['bytes'] for r in records),'main_refs':manifest['main_refs']},ensure_ascii=False))
