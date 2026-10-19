'use server';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { saveListing, rollbackListing } from '@/lib/listing-edits/service';
import { EditError } from '@/lib/listing-edits/policy';
export type EditState = {error?:string} | null;
function refresh(id:string,path:string) {
  for(const page of ['/', '/directory','/grants','/land-connect','/search',path,`/listings/${id}/edit`,`/listings/${id}/history`]) revalidatePath(page);
}
export async function editListingAction(id:string,_state:EditState,form:FormData):Promise<EditState> {
  const session=await auth();
  if(!session?.user?.id)return {error:'Sign in to edit this listing.'};
  let path:string;
  try {path=await saveListing({id:session.user.id,sessionVersion:session.user.sessionVersion},id,form);}
  catch(error){return {error:error instanceof EditError?error.message:'Your changes could not be saved. Please try again.'};}
  refresh(id,path);redirect(`${path}?updated=1`);
}
export async function rollbackListingAction(id:string,_state:EditState,form:FormData):Promise<EditState> {
  const session=await auth();
  if(!session?.user?.id)return {error:'Sign in with an administrator account to restore a revision.'};
  let path:string;
  try {path=await rollbackListing({id:session.user.id,sessionVersion:session.user.sessionVersion},id,form);}
  catch(error){return {error:error instanceof EditError?error.message:'The revision could not be restored. Please try again.'};}
  refresh(id,path);redirect(`/listings/${id}/history?restored=1`);
}
