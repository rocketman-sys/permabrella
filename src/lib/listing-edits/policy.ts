import { parseRegionParam } from '../regions';
import { parseSydneyDateTime } from '../posts/dates';

export const EDITABLE_TYPES = ['directory_entry', 'grant', 'land_available', 'land_wanted'] as const;
export const GRANT_STATUSES = ['Check current round', 'Open now', 'Rolling applications', 'Closed - track next round', 'Ongoing resource'] as const;
export const TEXT_FIELDS = {
  title: { label: 'Listing name', max: 300, required: true },
  description: { label: 'Description', max: 12000, required: true },
  contactMethod: { label: 'Contact instructions', max: 2000 },
  contactPhone: { label: 'Public contact phone', max: 80 },
  contactEmail: { label: 'Public contact email', max: 254 },
  externalUrl: { label: 'Website', max: 2000 },
  locationDetail: { label: 'Location or service area', max: 1000 },
  funding: { label: 'Funding', max: 2000 },
  whoCanApply: { label: 'Who can apply', max: 4000 },
  listingLabel: { label: 'Availability or listing note', max: 150 },
  communityNote: { label: 'What still needs checking?', max: 1500 },
} as const;
export type TextField = keyof typeof TEXT_FIELDS;
export type ListingContent = Record<TextField, string> & {
  region: string; grantStatus: string; deadlineDate: string; deadlineTime: string;
  advertisedStartDate: string; seasonEnd: string; communitySources: string[];
};
export const CONTENT_KEYS = [...Object.keys(TEXT_FIELDS), 'region', 'grantStatus', 'deadlineDate', 'deadlineTime', 'advertisedStartDate', 'seasonEnd', 'communitySources'] as (keyof ListingContent)[];
export class EditError extends Error {}
export const isUuid = (value: unknown): value is string => typeof value === 'string' && /^[a-f\d]{8}-([a-f\d]{4}-){3}[a-f\d]{12}$/i.test(value);
export const canEditListing = (type: string, status: string) => (EDITABLE_TYPES as readonly string[]).includes(type) && ['active', 'expired'].includes(status);
export function listingPath(id: string, type: string) {
  return `/${type === 'directory_entry' ? 'directory' : type === 'grant' ? 'grants' : 'land-connect'}/${id}`;
}
export function safePublicUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password && !!u.hostname && !/[\u0000-\u0020]/.test(value);
  } catch { return false; }
}
function plain(value: unknown, label: string, max: number, required = false): string {
  if (typeof value !== 'string') throw new EditError(`${label} must be text.`);
  const text = value.trim();
  if (text.length > max || required && !text) throw new EditError(`${label} ${required && !text ? 'is required' : `must be ${max} characters or fewer`}.`);
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text) || /<\/?[a-z][^>]*>/i.test(text)) throw new EditError(`${label} must be plain text without HTML.`);
  return text;
}
function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0,10) === value && +value.slice(0,4) >= 2000 && +value.slice(0,4) <= 2100;
}
export function validateContent(raw: unknown, type: string): ListingContent {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new EditError('Invalid listing content.');
  const input = raw as Record<string, unknown>;
  if (Object.keys(input).some(k => !(CONTENT_KEYS as string[]).includes(k))) throw new EditError('This form contains a protected or unknown field.');
  const out = {} as ListingContent;
  for (const [key, config] of Object.entries(TEXT_FIELDS)) out[key as TextField] = plain(input[key], config.label, config.max, 'required' in config);
  out.region = plain(input.region, 'Region', 30);
  if (out.region && !parseRegionParam(out.region)) throw new EditError('Choose a listed region.');
  if (out.externalUrl && !safePublicUrl(out.externalUrl)) throw new EditError('Website must be a full http or https URL without sign-in credentials.');
  if (out.contactEmail && !/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(out.contactEmail)) throw new EditError('Enter a valid public contact email.');
  if (out.contactPhone && !/^[+\d\s().\-/xext]+$/i.test(out.contactPhone)) throw new EditError('Enter a phone number using digits and normal phone punctuation.');
  for (const key of ['deadlineDate', 'advertisedStartDate', 'seasonEnd'] as const) {
    out[key] = plain(input[key], key === 'deadlineDate' ? 'Closing date' : key === 'seasonEnd' ? 'Season end' : 'Advertised start date', 10);
    if (out[key] && !validDate(out[key])) throw new EditError('Enter a valid date between 2000 and 2100.');
  }
  out.grantStatus = plain(input.grantStatus, 'Grant status', 50);
  if (out.grantStatus && !(GRANT_STATUSES as readonly string[]).includes(out.grantStatus)) throw new EditError('Choose a listed grant status.');
  out.deadlineTime = plain(input.deadlineTime, 'Closing time', 10);
  if (out.deadlineTime && out.deadlineTime !== 'end_of_day' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(out.deadlineTime)) throw new EditError('Use HH:MM in NSW time, end_of_day, or leave the closing time blank.');
  if (out.deadlineTime && !out.deadlineDate) throw new EditError('A closing time needs a closing date.');
  if (type !== 'grant' && [out.grantStatus,out.deadlineDate,out.deadlineTime,out.funding,out.whoCanApply].some(Boolean)) throw new EditError('Funding fields only apply to grants.');
  if (type === 'grant' && [out.listingLabel,out.advertisedStartDate,out.seasonEnd].some(Boolean)) throw new EditError('These availability fields do not apply to grants.');
  if (!Array.isArray(input.communitySources) || input.communitySources.length > 5 || input.communitySources.some(x => typeof x !== 'string' || x.length > 2000 || !safePublicUrl(x.trim()))) throw new EditError('Add up to five full http or https source URLs, one per line.');
  out.communitySources = [...new Set((input.communitySources as string[]).map(x => x.trim()))];
  return out;
}
export function parseEditForm(form: FormData, type: string) {
  const allowed = [...CONTENT_KEYS, 'version', 'summary'];
  for (const [key] of form) {
    if (key.startsWith('$ACTION_')) continue;
    if (!(allowed as string[]).includes(key) || form.getAll(key).length !== 1) throw new EditError('This form contains an unexpected or repeated field.');
  }
  const raw = Object.fromEntries(CONTENT_KEYS.map(k => [k, k === 'communitySources' ? String(form.get(k) ?? '').split(/\r?\n/).map(x=>x.trim()).filter(Boolean) : form.get(k) ?? '']));
  return { content: validateContent(raw,type), version: plain(form.get('version'),'Listing version',100,true), summary: plain(form.get('summary'),'Edit summary',500,true) };
}
export function publicName(displayName: string | null, username: string | null): string {
  return [displayName, username].find(x => x?.trim() && !x.includes('@'))?.trim().slice(0,150) || 'Community member';
}
export function contentFromRow(row: {type:string;title:string;description:string;contactMethod:string|null;contactPhone:string|null;contactEmail:string|null;externalUrl:string|null;region:string|null;locationDetail:string|null;metadata:Record<string,unknown>}): ListingContent {
  const m=row.metadata, text=(key:string)=>typeof m[key] === 'string' ? m[key] as string : '';
  return {title:row.title,description:row.description,contactMethod:row.contactMethod??'',contactPhone:row.contactPhone??'',contactEmail:row.contactEmail??'',externalUrl:row.externalUrl??'',region:row.region??'',locationDetail:row.locationDetail??'',funding:row.type==='grant'?text('funding'):'',whoCanApply:row.type==='grant'?text('whoCanApply'):'',grantStatus:row.type==='grant'?text('statusLabel'):'',deadlineDate:row.type==='grant'?text('deadlineDate'):'',deadlineTime:row.type==='grant'?text('deadlineTime'):'',listingLabel:row.type==='grant'?'':text('listingLabel'),advertisedStartDate:row.type==='grant'?'':text('advertisedStartDate'),seasonEnd:row.type==='grant'?'':text('seasonEnd'),communityNote:text('communityNote'),communitySources:Array.isArray(m.communitySources)?m.communitySources.filter((x):x is string=>typeof x==='string'&&safePublicUrl(x)):[]};
}
export function metadataPatch(content: ListingContent, type: string) {
  return {...(type==='grant'?{funding:content.funding,whoCanApply:content.whoCanApply,statusLabel:content.grantStatus,deadlineDate:content.deadlineDate||null,deadlineTime:content.deadlineTime||null,deadlineConfirmed:false}:{listingLabel:content.listingLabel,advertisedStartDate:content.advertisedStartDate||null,seasonEnd:content.seasonEnd||null}),communityNote:content.communityNote,communitySources:content.communitySources,communityEdited:true,verificationStatus:'needs_verification'};
}
export function grantExpiry(content: ListingContent): string | null {
  if (!content.deadlineDate || ['Rolling applications','Ongoing resource','Check current round'].includes(content.grantStatus)) return null;
  if (content.deadlineTime && content.deadlineTime!=='end_of_day') {
    const date=parseSydneyDateTime(`${content.deadlineDate}T${content.deadlineTime}`);
    if(!date)throw new EditError('That closing time does not exist in NSW time.');
    return date.toISOString();
  }
  const next=new Date(`${content.deadlineDate}T12:00:00Z`);next.setUTCDate(next.getUTCDate()+1);
  return parseSydneyDateTime(`${next.toISOString().slice(0,10)}T00:00`)!.toISOString();
}
