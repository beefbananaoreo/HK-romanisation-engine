import hashlib,json,sys
from pathlib import Path
if sys.flags.optimize:
    raise SystemExit('Static obligation checks require assertions; run without -O or PYTHONOPTIMIZE.')
root=Path(__file__).resolve().parents[1]
fixtures=json.loads((root/'obligations/case-fixtures.json').read_text(encoding='utf-8'))
coverage=json.loads((root/'obligations/coverage-map.json').read_text(encoding='utf-8'))
packet_path='spec/HKLanguageLabPacket-v1.7.md'
packet=(root/packet_path).read_bytes()
assert fixtures['authority']==coverage['authority'], 'Fixture authority metadata differs between sources'
for document in (fixtures,coverage):
    authority=document['authority']
    assert authority['path']==packet_path, 'Unexpected authority packet path'
    assert authority['bytes']==len(packet), 'Authority packet byte count differs'
    assert authority['sha256']==hashlib.sha256(packet).hexdigest(), 'Authority packet SHA-256 differs'
cases=fixtures['renderingCases'];ids=[x['id'] for x in cases]
assert len(ids)==len(set(ids))==25
expected_coverage_ids={
    'T-HKR-045','T-ENT-059','T-API-004','T-API-030','T-API-033',
    'T-API-055','T-API-056','T-API-057','T-API-058','T-API-059',
    'T-API-060','T-API-061','T-API-062','T-API-063','T-API-064',
    'G7','G14','G15','G16','G28','G29','G30','G31','G32','G33','G34','G35',
}
coverage_ids=[row['id'] for row in coverage['rows']]
assert len(coverage_ids)==len(set(coverage_ids)), 'Duplicate coverage row IDs'
assert set(coverage_ids)==expected_coverage_ids, 'Coverage row IDs differ from the bounded gate set'
structural_ids=[item['id'] for item in fixtures['structuralObligations']]
assert len(structural_ids)==len(set(structural_ids))==4, 'Structural obligation IDs must be unique'
for item in cases+fixtures['structuralObligations']:
    assert set(item['testIds'])<=expected_coverage_ids, 'Unknown fixture test ID'
for row in coverage['rows']:
    for obligation in row['subObligations']:
        assert set(obligation.get('caseIds',[]))<=set(ids), 'Unknown rendering case reference'
        assert set(obligation.get('obligationIds',[]))<=set(structural_ids), 'Unknown structural obligation reference'
cross_runtime=fixtures['crossRuntimeObligation']
assert set(cross_runtime['testIds']+cross_runtime['gateIds'])<=expected_coverage_ids, 'Unknown cross-runtime test/gate ID'
assert len(cross_runtime['coversCaseIds'])==len(ids) and set(cross_runtime['coversCaseIds'])==set(ids), 'Cross-runtime case coverage differs'
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
