import fs from 'node:fs';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import {parse} from 'node-html-parser';
const markdown = new MarkdownIt({html:true});
export function absoluteSiteUrl(base, pathname='/') {
  const root = new URL(base || 'https://ansatz.work');
  if (!['http:', 'https:'].includes(root.protocol)) throw new Error('SITE_BASE_URL must be HTTP(S)');
  return new URL(pathname, root.origin).href;
}
export function dateModified(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}
export function pageSeo(data, raw='') {
  const home=data.page?.url==='/' || data.permalink==='/';
  const title=data.title || (home ? 'Cunxi Gong (ansatz)' : raw.match(/^#\s+(.+)$/m)?.[1]) || data.page?.fileSlug || 'ansatz';
  const html=parse(markdown.render(raw));
  html.querySelectorAll('style,script,pre,code').forEach(n=>n.remove());
  const text=html.structuredText.replace(/\s+/g,' ').trim();
  const description=String(data.description || data['dg-description'] || data.metatags?.description || text || 'Physics, scientific software and research notes by Cunxi Gong.').slice(0,180);
  return {
    title: home ? title : `${title} · ${data.meta?.siteName || 'ansatz'}`,
    description,
    canonical:absoluteSiteUrl(data.meta?.siteBaseUrl, data.page?.url || data.permalink || '/'),
    image:absoluteSiteUrl(data.meta?.siteBaseUrl, data.socialImage || '/img/social-card.png'),
    imageAlt:data.socialImageAlt || 'Cunxi Gong (ansatz) — Physics and scientific software',
    type:home?'website':'article',
    noindex:data.noindex===true || /\bnoindex\b/i.test(data.robots || data.metatags?.robots || ''),
    robots:data.noindex===true ? 'noindex,follow' : (data.robots || data.metatags?.robots || ''),
    modified:dateModified(data.updated || data['dg-updated'] || data.date),
  };
}
export function computedSeo(data) {
  let raw='';
  const file=data.page?.inputPath;
  if(file?.endsWith('.md')) raw=matter(fs.readFileSync(file,'utf8')).content;
  return pageSeo(data,raw);
}
