import 'server-only';
import { randomUUID } from 'node:crypto';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { listingRevisions, posts, users } from '@/lib/db/schema';
import { canEditListing, contentFromRow, EditError, isUuid, listingPath, parseEditForm, publicName, validateContent } from './policy';
import { mutationQuery } from './queries';

export type Editor = { id: string; sessionVersion: number };
export async function getEditor(actor: Editor | null) {
  if (!actor || !isUuid(actor.id) || !Number.isInteger(actor.sessionVersion)) return null;
  const [user] = await db.select({name:users.displayName,username:users.username,role:users.role})
    .from(users).where(and(eq(users.id,actor.id),eq(users.sessionVersion,actor.sessionVersion))).limit(1);
  return user ? { ...actor, name: publicName(user.name,user.username), isAdmin: user.role==='admin' } : null;
}
export async function getEditableListing(id: string) {
  if (!isUuid(id)) return null;
  const [row] = await db.select({id:posts.id,type:posts.type,status:posts.status,title:posts.title,description:posts.description,
    contactMethod:posts.contactMethod,contactPhone:posts.contactPhone,contactEmail:posts.contactEmail,
    externalUrl:posts.externalUrl,region:posts.region,locationDetail:posts.locationDetail,metadata:posts.metadata,
    version:sql<string>`${posts.id}::text||':'||${posts.updatedAt}::text`,
  }).from(posts).where(eq(posts.id,id)).limit(1);
  if (!row || !canEditListing(row.type,row.status)) return null;
  return {id:row.id,type:row.type,version:row.version,path:listingPath(row.id,row.type),content:contentFromRow(row)};
}
export async function saveListing(actor: Editor | null, id: string, form: FormData) {
  const editor = await getEditor(actor);
  if (!editor) throw new EditError('Sign in to edit this listing.');
  const listing = await getEditableListing(id);
  if (!listing) throw new EditError('This listing is not available for community editing.');
  const input = parseEditForm(form,listing.type);
  if (input.version!==listing.version) throw new EditError('Someone updated this listing while you were editing. Your text is still here. Open the current listing in a new tab, then reload this form and reapply your changes.');
  if (JSON.stringify(input.content)===JSON.stringify(validateContent(listing.content,listing.type))) throw new EditError('No changes to save.');
  const result = await db.execute(mutationQuery({id,type:listing.type,version:input.version,actorId:editor.id,sessionVersion:editor.sessionVersion,
    revisionId:randomUUID(),before:listing.content,after:input.content,summary:input.summary,kind:'edit',restoredFromId:null}));
  if (!result.rows.length) throw new EditError('The listing changed, your session ended, or the hourly edit limit was reached. Review the current listing and try again.');
  return listing.path;
}
export async function listRevisions(id: string, page=1) {
  const listing=await getEditableListing(id);
  if(!listing)return null;
  const revisions=await db.select({id:listingRevisions.id,editorName:listingRevisions.editorName,kind:listingRevisions.kind,
    summary:listingRevisions.summary,before:listingRevisions.before,after:listingRevisions.after,createdAt:listingRevisions.createdAt})
    .from(listingRevisions).where(eq(listingRevisions.postId,id)).orderBy(desc(listingRevisions.createdAt),desc(listingRevisions.id)).limit(21).offset((page-1)*20);
  return {listing,revisions:revisions.slice(0,20),hasNext:revisions.length>20};
}
export async function rollbackListing(actor: Editor | null,id:string,form:FormData) {
  const editor=await getEditor(actor);
  if(!editor?.isAdmin)throw new EditError('Only administrators can restore a revision.');
  for(const [key] of form)if(!key.startsWith('$ACTION_')&&(!['revisionId','version','restoreSide'].includes(key)||form.getAll(key).length!==1))throw new EditError('Invalid restore request.');
  const revisionId=form.get('revisionId'), side=form.get('restoreSide');
  if(!isUuid(revisionId)||!['before','after'].includes(String(side)))throw new EditError('Choose a revision to restore.');
  const listing=await getEditableListing(id);
  if(!listing)throw new EditError('Listing unavailable.');
  if(form.get('version')!==listing.version)throw new EditError('The listing changed. Reload its history before restoring a version.');
  const [revision]=await db.select({before:listingRevisions.before,after:listingRevisions.after}).from(listingRevisions)
    .where(and(eq(listingRevisions.id,revisionId),eq(listingRevisions.postId,id))).limit(1);
  if(!revision)throw new EditError('This revision does not belong to this listing.');
  const content=validateContent(side==='before'?revision.before:revision.after,listing.type);
  const result=await db.execute(mutationQuery({id,type:listing.type,version:listing.version,actorId:editor.id,sessionVersion:editor.sessionVersion,
    revisionId:randomUUID(),before:listing.content,after:content,summary:`Restored the ${side==='before'?'previous':'saved'} content of revision ${revisionId}.`,kind:'rollback',restoredFromId:revisionId}));
  if(!result.rows.length)throw new EditError('Restore did not apply. Reload the history and check your administrator session or hourly edit limit.');
  return listing.path;
}
