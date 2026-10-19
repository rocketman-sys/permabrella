import assert from 'node:assert/strict';
import test from 'node:test';
import { verificationDetails, publicSourceUrls } from './verification';
import { listingFreshness, type FreshnessPost } from './freshness';
const base:FreshnessPost={type:'land_available',status:'active',eventDate:null,expiresAt:null,createdAt:new Date('2026-10-19'),updatedAt:new Date('2026-10-19'),metadata:{}};
test('verification detail is specific and carries a date without claiming successful verification',()=>{
 assert.deepEqual(verificationDetails({verificationNote:'  Confirm the venue. ',lastCheckedAt:'2026-10-19'}),{note:'Confirm the venue.',checked:'2026-10-19'});
 assert.deepEqual(publicSourceUrls({sourceUrls:['javascript:alert(1)','https://example.org/','https://example.org/',42]}),['https://example.org/']);
});
test('resource and lead labels do not imply available land',()=>{
 assert.equal(listingFreshness({...base,metadata:{listingLabel:'Platform with local coverage'}}).label,'Platform with local coverage');
 assert.equal(listingFreshness({...base,metadata:{advertisedStartDate:'2026-10-26'}},new Date('2026-10-27')).label,'Advertised start date passed');
});
test('closed CSA enrolment becomes a past season after the recorded season ends',()=>{
 const post={...base,type:'directory_entry' as const,metadata:{listingLabel:'CSA · enrolment closed',seasonEnd:'2026-11-30'}};
 assert.equal(listingFreshness(post,new Date('2026-10-19')).label,'CSA · enrolment closed');
 assert.equal(listingFreshness(post,new Date('2026-12-01')).label,'Past CSA season');
});
