import { CONTENT_KEYS, TEXT_FIELDS, type ListingContent } from '@/lib/listing-edits/policy';
import { RollbackForm } from './RollbackForm';
export type PublicRevision={id:string;editorName:string;kind:string;summary:string;before:ListingContent;after:ListingContent;createdAt:Date};
const labels:Record<string,string>={...Object.fromEntries(Object.entries(TEXT_FIELDS).map(([k,v])=>[k,v.label])),region:'Region',grantStatus:'Grant status',deadlineDate:'Closing date',deadlineTime:'Closing time (NSW)',advertisedStartDate:'Advertised start date',seasonEnd:'Season end',communitySources:'Community sources'};
const show=(value:unknown)=>(Array.isArray(value)?value.join('\n'):String(value??''))||'Not specified';
export function RevisionList({id,version,revisions,isAdmin}:{id:string;version:string;revisions:PublicRevision[];isAdmin:boolean}) {
  return <ol className="mt-6 space-y-5">{revisions.map(r=><li key={r.id} className="rounded-xl border border-[var(--pb-line)] bg-white p-4 sm:p-6">
    <p className="font-semibold">{r.editorName.includes('@')?'Community member':r.editorName} · {r.kind==='rollback'?'Restored content':'Edited listing'}</p>
    <p className="mt-1 text-sm text-[var(--pb-muted)]"><time dateTime={r.createdAt.toISOString()}>{r.createdAt.toLocaleString('en-AU',{timeZone:'Australia/Sydney',dateStyle:'medium',timeStyle:'short'})} NSW time</time></p>
    <p className="mt-3 whitespace-pre-wrap text-sm">{r.summary}</p>
    <details className="mt-4"><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">Compare before and after</summary><dl className="space-y-4">{CONTENT_KEYS.filter(k=>JSON.stringify(r.before[k])!==JSON.stringify(r.after[k])).map(k=><div key={k}><dt className="mb-2 font-semibold">{labels[k]}</dt><dd className="grid gap-3 sm:grid-cols-2"><div className="min-w-0 rounded bg-red-50 p-3"><p className="mb-1 text-xs font-semibold">Before</p><p className="whitespace-pre-wrap text-sm">{show(r.before[k])}</p></div><div className="min-w-0 rounded bg-green-50 p-3"><p className="mb-1 text-xs font-semibold">After</p><p className="whitespace-pre-wrap text-sm">{show(r.after[k])}</p></div></dd></div>)}</dl></details>
    {isAdmin?<RollbackForm id={id} revisionId={r.id} version={version}/>:null}
  </li>)}</ol>;
}
