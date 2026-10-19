'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { editListingAction, type EditState } from '@/app/listings/actions';
import { GRANT_STATUSES, TEXT_FIELDS, type ListingContent, type TextField } from '@/lib/listing-edits/policy';
import { REGIONS } from '@/lib/regions';
const inputClass='mt-1 min-h-11 w-full min-w-0 rounded-lg border border-[var(--pb-line)] bg-white px-3 py-2 text-base focus:outline-2 focus:outline-[var(--pb-accent-2)]';
const buttonClass='inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--pb-primary)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50';
export function EditForm({listing,editorName,action}:{listing:{id:string;type:string;version:string;path:string;content:ListingContent};editorName:string;action?:(state:EditState,form:FormData)=>Promise<EditState>}) {
  const [state,formAction,pending]=useActionState(action??editListingAction.bind(null,listing.id),null);
  const [draft,setDraft]=useState<Record<string,string>>(()=>({...Object.fromEntries(Object.entries(listing.content).map(([k,v])=>[k,Array.isArray(v)?v.join('\n'):v])),summary:''}));
  const control=(name:string)=>({name,value:draft[name]??'',onChange:(event:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>setDraft(current=>({...current,[name]:event.target.value}))});
  const errorRef=useRef<HTMLParagraphElement>(null);
  useEffect(()=>{if(state?.error)errorRef.current?.focus();},[state]);
  const grant=listing.type==='grant';
  function field(name:TextField,rows?:number) {
    const config=TEXT_FIELDS[name];
    const attrs={id:`edit-${name}`,...control(name),maxLength:config.max,required:'required' in config,className:inputClass};
    return <div key={name}><label htmlFor={attrs.id} className="text-sm font-semibold">{config.label}{'required' in config?' *':''}</label>{rows?<textarea {...attrs} rows={rows}/>:<input {...attrs} type={name==='contactEmail'?'email':name==='externalUrl'?'url':name==='contactPhone'?'tel':'text'}/>}</div>;
  }
  return <form action={formAction} className="mt-6 min-w-0 space-y-5">
    <input type="hidden" name="version" value={listing.version}/>
    <p className="rounded-lg bg-[var(--pb-bg)] p-4 text-sm leading-relaxed">Your changes publish immediately with your public name, <strong>{editorName}</strong>, and the time of the edit. Previous versions remain in public history. Use public information, link your sources and say what still needs checking. Edits are not independently verified.</p>
    {field('title')}{field('description',9)}
    <div className="grid min-w-0 gap-5 sm:grid-cols-2">
      <div><label htmlFor="edit-region" className="text-sm font-semibold">Region</label><select id="edit-region" {...control("region")} className={inputClass}><option value="">All / not specified</option>{REGIONS.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
      {field('locationDetail')}
    </div>
    <fieldset className="space-y-4"><legend className="mb-3 font-semibold">Public contact details</legend>{field('externalUrl')}{field('contactPhone')}{field('contactEmail')}{field('contactMethod',3)}</fieldset>
    {grant?<fieldset className="space-y-4"><legend className="mb-3 font-semibold">Funding details</legend>{field('funding',3)}{field('whoCanApply',4)}
      <div><label htmlFor="edit-grantStatus" className="text-sm font-semibold">Grant status</label><select id="edit-grantStatus" {...control("grantStatus")} className={inputClass}><option value="">Check with provider</option>{GRANT_STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
      <div><label htmlFor="edit-deadlineDate" className="text-sm font-semibold">Closing date</label><input id="edit-deadlineDate" {...control("deadlineDate")} type="date" min="2000-01-01" max="2100-12-31" className={inputClass}/></div>
      <div><label htmlFor="edit-deadlineTime" className="text-sm font-semibold">Closing time, if published (NSW time)</label><input id="edit-deadlineTime" {...control("deadlineTime")} maxLength={10} placeholder="17:00 or end_of_day" className={inputClass}/><p className="mt-1 text-sm text-[var(--pb-muted)]">Leave blank if the closing time is unknown. A date without a time stays listed through that day.</p></div>
    </fieldset>:<fieldset className="space-y-4"><legend className="mb-3 font-semibold">Availability</legend>{field('listingLabel')}
      {(['advertisedStartDate','seasonEnd'] as const).map(key=><div key={key}><label htmlFor={`edit-${key}`} className="text-sm font-semibold">{key==='seasonEnd'?'Season end, if relevant':'Advertised start date, if relevant'}</label><input id={`edit-${key}`} {...control(key)} type="date" min="2000-01-01" max="2100-12-31" className={inputClass}/></div>)}
    </fieldset>}
    {field('communityNote',3)}
    <div><label htmlFor="edit-communitySources" className="text-sm font-semibold">Supporting public sources</label><textarea id="edit-communitySources" {...control("communitySources")} rows={3} maxLength={10004} className={inputClass}/><p className="mt-1 text-sm text-[var(--pb-muted)]">Up to five full website links, one per line. These are shown as community-provided sources.</p></div>
    <div><label htmlFor="edit-summary" className="text-sm font-semibold">What did you change, and why? *</label><textarea id="edit-summary" {...control("summary")} required maxLength={500} rows={3} className={inputClass}/></div>
    {state?.error?<p role="alert" tabIndex={-1} ref={errorRef} className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">{state.error}</p>:null}
    <div className="flex flex-wrap gap-3"><button className={buttonClass} disabled={pending} type="submit">{pending?'Saving…':'Publish changes'}</button><Link className="inline-flex min-h-11 items-center px-3 text-sm underline" href={listing.path}>Cancel</Link><a href={listing.path} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center px-3 text-sm underline">View current listing (new tab)</a></div>
  </form>;
}
