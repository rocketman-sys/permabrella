import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getEditor, listRevisions } from '@/lib/listing-edits/service';
import { RevisionList } from '@/components/listing-edits/RevisionList';
export const metadata={title:'Listing edit history',robots:{index:false,follow:true}};
export default async function HistoryPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{page?:string;restored?:string}>}) {
  const {id}=await params;const search=await searchParams;const page=Math.max(1,Math.min(10000,Number.parseInt(search.page??'1',10)||1));
  const data=await listRevisions(id,page);if(!data)notFound();
  const session=await auth();const editor=await getEditor(session?.user?{id:session.user.id,sessionVersion:session.user.sessionVersion}:null);
  return <div className="mx-auto max-w-4xl min-w-0 px-4 py-10 [overflow-wrap:anywhere]"><Link href={data.listing.path} className="text-sm underline">← Back to listing</Link><h1 className="mt-5 text-2xl font-semibold">Edit history: {data.listing.content.title}</h1><p className="mt-3 text-sm leading-relaxed">Community edits publish with the editor’s public name and time. Expand a revision to compare the changed fields. Earlier research and imports predate this history. Administrators can restore previous content while keeping every revision.</p>
    {search.restored==='1'?<p role="status" className="mt-4 rounded bg-green-50 p-3">The selected content was restored and recorded as a new revision.</p>:null}
    {!data.revisions.length?<p className="mt-6">No community edits have been recorded{page>1?' on this page':''}.</p>:<RevisionList id={id} version={data.listing.version} revisions={data.revisions} isAdmin={Boolean(editor?.isAdmin)}/>}
    <nav aria-label="History pages" className="mt-6 flex gap-6">{page>1?<Link href={`/listings/${id}/history?page=${page-1}`} className="min-h-11 underline">Newer revisions</Link>:null}{data.hasNext?<Link href={`/listings/${id}/history?page=${page+1}`} className="min-h-11 underline">Older revisions</Link>:null}</nav>
  </div>;
}
