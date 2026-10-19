import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getEditableListing, getEditor } from '@/lib/listing-edits/service';
import { EditForm } from '@/components/listing-edits/EditForm';
export const metadata={title:'Edit community listing',robots:{index:false,follow:false}};
export default async function EditListingPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const listing=await getEditableListing(id);
  if(!listing)notFound();
  const session=await auth();
  const editor=await getEditor(session?.user?{id:session.user.id,sessionVersion:session.user.sessionVersion}:null);
  if(!editor)redirect(`/login?callbackUrl=${encodeURIComponent(`/listings/${id}/edit`)}`);
  return <div className="mx-auto max-w-3xl min-w-0 px-4 py-10"><Link className="text-sm underline" href={listing.path}>← Back to listing</Link><h1 className="mt-5 text-2xl font-semibold">Edit {listing.content.title}</h1><EditForm listing={listing} editorName={editor.name}/></div>;
}
