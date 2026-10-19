export type TextPart = { text: string; href?: string };

/** Plain text in, plain text and validated web URLs out. Never parses user HTML. */
export function sharedTextParts(text: string, maxLength?: number): TextPart[] {
  const parts: TextPart[] = [];
  // Consume literal HTML tags as text so attributes aren't partially linkified.
  const pattern = /<[^<>\n]*>|(?:https?:\/\/|www\.)[^\s<>"'`\u0000-\u001f\u007f]+/giu;
  let end = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index!;
    let candidate = match[0];
    if (candidate.startsWith('<')) continue;
    // Reject embedded schemes, email fragments and protocol lookalikes.
    if (start > 0 && /[\p{L}\p{N}_@:/\\.\-]/u.test(text[start - 1])) continue;
    // Count brackets once; repeated unmatched closing punctuation stays linear.
    const balances:Record<string,number>={')':0,']':0,'}':0};
    const closing:Record<string,string>={'(':')','[':']','{':'}'};
    for(const char of candidate){
      if(closing[char])balances[closing[char]]++;
      else if(char in balances)balances[char]--;
    }
    let length=candidate.length;
    while(length){
      const char=candidate[length-1];
      if(/[.,!?;:…\u2018\u2019\u201c\u201d]/u.test(char)){length--;continue;}
      if(char in balances && balances[char]<0){balances[char]++;length--;continue;}
      break;
    }
    candidate=candidate.slice(0,length);
    let href: string;
    try {
      const url = new URL(/^www\./i.test(candidate) ? `https://${candidate}` : candidate);
      if (!['https:', 'http:'].includes(url.protocol) || !url.hostname || url.username || url.password || /[\\\u202a-\u202e\u2066-\u2069]/u.test(candidate)) continue;
      href = url.href;
    } catch { continue; }
    if (start > end) parts.push({ text: text.slice(end, start) });
    parts.push({ text: candidate, href });
    end = start + candidate.length;
  }
  if (end < text.length) parts.push({ text: text.slice(end) });
  if (maxLength === undefined || text.length <= maxLength) return parts;
  let remaining = Math.max(0, maxLength - 1);
  const clipped: TextPart[] = [];
  for (const part of parts) {
    if (!remaining) break;
    clipped.push({ ...part, text: part.text.slice(0, remaining) });
    remaining -= Math.min(remaining, part.text.length);
  }
  clipped.push({ text: '…' });
  return clipped;
}
