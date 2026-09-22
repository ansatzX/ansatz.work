import { test, expect } from '@playwright/test';
import { parse } from 'node-html-parser';
import dotenv from 'dotenv';
dotenv.config();
const origin = new URL(process.env.SITE_BASE_URL || 'https://ansatz.work').origin;

test('robots advertises the canonical sitemap; sitemap has unique public page URLs', async ({request}) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap.xml`);
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200); expect(res.headers()['content-type']).toContain('xml');
  const xml = await res.text();
  expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  const tree = parse(xml), entries = tree.querySelectorAll('url');
  expect(entries.length).toBeGreaterThan(0);
  const urls = entries.map(e=>e.querySelector('loc').textContent);
  expect(new Set(urls).size).toBe(urls.length); expect(urls).toContain(`${origin}/`);
  for (const entry of entries) {
    const url = new URL(entry.querySelector('loc').textContent);
    expect(url.origin).toBe(origin); expect(url.pathname).not.toContain('/404');
    const modified = entry.querySelector('lastmod');
    if(modified) expect(Number.isNaN(Date.parse(modified.textContent))).toBe(false);
    const page = await request.get(url.pathname);
    expect(page.status()).toBe(200);
    const html = parse(await page.text());
    expect(html.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(url.href);
    expect(html.querySelector('meta[name="robots"]')?.getAttribute('content') || '').not.toMatch(/noindex/i);
    expect(html.querySelector('meta[property="og:image"]').getAttribute('content')).toMatch(/^https?:/);
  }
});

test('comments and shortcut share a target, and favicon assets are served', async ({request}) => {
  const page = parse(await (await request.get('/blogs/2025-02-01/')).text());
  const enabled = /^(true|1)$/i.test(process.env.GISCUS_ENABLED || 'false');
  expect(page.querySelectorAll('#giscus-container').length).toBe(enabled ? 1 : 0);
  expect(page.querySelectorAll('.comments-shortcut a').length).toBe(enabled ? 1 : 0);
  if(enabled) {
    expect(page.querySelector('.comments-shortcut a').getAttribute('href')).toBe('#giscus-container');
    expect(page.querySelector('#giscus-container script').getAttribute('data-category-id')).toBe(process.env.GISCUS_CATEGORY_ID);
  }
  for(const path of ['/favicon.ico','/favicon.svg','/apple-touch-icon.png','/icon-192.png','/icon-512.png','/manifest.webmanifest']) {
    expect((await request.get(path)).status(),path).toBe(200);
  }
});

test('missing pages return actual 404 with noindex', async ({request}) => {
  const response = await request.get('/__acceptance_missing_page__');
  expect(response.status()).toBe(404);
  expect(parse(await response.text()).querySelector('meta[name="robots"]').getAttribute('content')).toContain('noindex');
});
