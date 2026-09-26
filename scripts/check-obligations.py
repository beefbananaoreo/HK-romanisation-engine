import hashlib,json,sys
from pathlib import Path
if sys.flags.optimize:
    raise SystemExit('Static obligation checks require assertions; run without -O or PYTHONOPTIMIZE.')
root=Path(__file__).resolve().parents[1]
fixtures=json.loads((root/'obligations/case-fixtures.json').read_text(encoding='utf-8'))
coverage=json.loads((root/'obligations/coverage-map.json').read_text(encoding='utf-8'))
cases=fixtures['renderingCases'];ids=[x['id'] for x in cases]
assert len(ids)==len(set(ids))==25
assert fixtures['profileOrder']==['hyphenated','joined','spaced','hyphen_title','surname_caps']
assert fixtures['casingOrder']==['lower','sentence','title','upper']
hex_count=0
for c in cases:
    assert c['executed'] is False and c['status']=='RENDERING_OBLIGATION_ONLY'
    if 'formCase' in c['input']:assert c['input']['formCase'] in ids
    for expected in c['expected']:
        if 'utf16beCodeUnitsHex' in expected:
            assert expected['text'].encode('utf-16-be','surrogatepass').hex()==expected['utf16beCodeUnitsHex'];hex_count+=1
assert len(coverage['rows'])==27
record={'staticCases':len(cases),'coverageRows':len(coverage['rows']),'verifiedLiteralUtf16HexValues':hex_count,'renderersImplemented':False,'renderersExecuted':False,'status':'STATIC_MATERIALISATION_INTEGRITY_PASS'}
output=json.dumps(record,indent=2)+'\n';path=root/'evidence/obligations-materialisation.json'
if '--record' in sys.argv:path.write_text(output,encoding='utf-8',newline='\n')
else:assert path.read_text(encoding='utf-8')==output
print(output,end='')
