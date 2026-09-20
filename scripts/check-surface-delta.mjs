import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const record=process.argv.includes('--record');
const old=JSON.parse(readFileSync('baseline/schema-5.0.14.json','utf8'));
const current=JSON.parse(readFileSync('generated/hklang-contract-5.0.16.schema.json','utf8'));
function diff(a,b){return {added:Object.keys(b).filter(k=>!(k in a)).sort(),removed:Object.keys(a).filter(k=>!(k in b)).sort(),changed:Object.keys(a).filter(k=>k in b&&JSON.stringify(a[k])!==JSON.stringify(b[k])).sort(),unchanged:Object.keys(a).filter(k=>k in b&&JSON.stringify(a[k])===JSON.stringify(b[k])).length};}
const schema=diff(old.$defs,current.$defs);
const expected={added:['NonEmptyArray','NonEmptyReadonlyArray'],removed:[],changed:['AssembledRomanisation','Grouping','MemoryAssembledRomanisation','Versions'],unchanged:172};
if(JSON.stringify(schema)!==JSON.stringify(expected))throw new Error('Unexpected schema delta '+JSON.stringify(schema));
// Compare the exact declaration token streams; omit comments/formatting only.
// Quoted literals are consumed before comment markers, so their bytes are preserved.
const lex=/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\/\*[\s\S]*?\*\/|\/\/[^\n]*|([A-Za-z_$][\w$]*|\d+(?:\.\d+)?|[^\s])/g;
function declarations(path){
 const text=readFileSync(path,'utf8');
 const clean=[...text.matchAll(lex)].filter(m=>m[1]||m[2]).map(m=>m[1]||m[2]);
 const out={};let key=null;let tokens=[];
 for(let i=0;i<clean.length;i++){
  if(clean[i]==='export'){
   if(key!==null)out[key]=tokens;
   key=clean[i+1]==='declare'?clean[i+3]:clean[i+2];tokens=[];
  }
  tokens.push(clean[i]);
 }
 if(key!==null)out[key]=tokens;
 return out;
}
const typeDelta=diff(declarations('baseline/public-contract-5.0.14.ts'),declarations('src/public-contract.ts'));
const allowedTypes=['AssembledRomanisation','AssembledEnglishFormBase','StyledPersonEnglishForm','MemoryRomanisation','MemoryAssembledEnglishFormBase','MemoryStyledPersonEnglishForm'];
if(typeDelta.removed.length||JSON.stringify(typeDelta.added)!==JSON.stringify(expected.added)||typeDelta.changed.some(k=>!allowedTypes.includes(k)))throw new Error('Unexpected type delta '+JSON.stringify(typeDelta));
const output=JSON.stringify({schema,typeDelta,authority:'CHG-050 §§5.2–5.3,5.6–5.7,5.10.2',unrelatedExistingSchemaDefinitions:'172 unchanged',baselineSchemaSha256:createHash('sha256').update(readFileSync('baseline/schema-5.0.14.json')).digest('hex')},null,2)+'\n';
mkdirSync('evidence',{recursive:true});
const path='evidence/public-surface-delta.json';
if(record)writeFileSync(path,output);else if(readFileSync(path,'utf8')!==output)throw new Error('Surface delta evidence differs');
process.stdout.write(output);
