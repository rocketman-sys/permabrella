import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import Link from 'next/link';
import { renderToStaticMarkup } from 'react-dom/server';
import { sharedTextParts } from './shared-text';
import { SharedText } from '../components/ui/SharedText';
import { ThreadCard } from '../components/community/ThreadCard';
Object.assign(globalThis,{React});
const links=(text:string)=>sharedTextParts(text).filter(p=>p.href);
test('web schemes and www preserve text, punctuation, line breaks and balanced parentheses',()=>{
  const text='See https://example.org/a_(b).\n(http://example.org?q=x&b=2), [www.example.org/path]!';
  assert.deepEqual(links(text).map(x=>x.href),['https://example.org/a_(b)','http://example.org/?q=x&b=2','https://www.example.org/path']);
  assert.equal(sharedTextParts(text).map(x=>x.text).join(''),text);
  assert.equal(links('HTTPS://example.org/test “https://example.org/next”').length,2);
});
test('unsafe protocols, embedded schemes, malformed URLs and credential lookalikes stay plain text',()=>{
  for(const text of ['javascript:alert(1)','data:text/html,<script>alert(1)</script>','javascript:https://example.org','ftp://www.example.org','email@www.example.org','https://user:pass@example.org','https://','https://example.org\\evil','https://exam\u202eple.org'])assert.equal(links(text).length,0,text);
});
test('literal HTML remains escaped and existing rendered anchors are untouched',()=>{
  const text='<a href="https://example.org">Hi</a> <img src=x onerror=alert(1)> https://safe.example/?a=1&b=2';
  const html=renderToStaticMarkup(<SharedText text={text}/>);
  assert.ok(html.includes('&lt;a href='));assert.ok(!html.includes('<img'));
  assert.equal((html.match(/<a /g)??[]).length,1);
  assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
  assert.ok(html.includes('(opens in a new tab)'));
  const existing=renderToStaticMarkup(<><Link href="/community">Existing internal link</Link><SharedText text=" www.example.org"/></>);
  assert.ok(existing.startsWith('<a href="/community">'));assert.ok(!existing.includes('<a href="/community" target'));
});
test('clipped previews keep the complete destination and avoid nested card anchors',()=>{
  const url='https://example.org/'+ 'very-long-'.repeat(50);
  const parts=sharedTextParts(url,50);assert.equal(parts[0].href,url);assert.equal(parts.map(p=>p.text).join('').length,50);
  const html=renderToStaticMarkup(<ThreadCard row={{thread:{id:'thread',title:'Thread',body:url,region:null,isPinned:false,createdAt:new Date()},authorDisplay:null,authorBadge:null,activity:{totalReplyCount:0,lastReplyAt:null,recentReplyTimes:[]}}} topicSlug="gardening" now={Date.now()}/>);
  const anchors=html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g)??[];
  assert.equal(anchors.length,2);assert.ok(anchors.every(a=>(a.match(/<a\b/g)??[]).length===1));assert.ok(html.includes('after:absolute'));
});

test('long unmatched punctuation and tag-like strings preserve text without repeated rescanning',()=>{
  const text='<'.repeat(30000)+' https://example.org/a_(b)'+')'.repeat(30000)+'.';
  const parts=sharedTextParts(text);
  assert.deepEqual(parts.filter(p=>p.href).map(p=>p.href),['https://example.org/a_(b)']);
  assert.equal(parts.map(p=>p.text).join(''),text);
});
