import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const SITE_URL = 'https://ansatz.work';

test.describe('Sitemap Tests', () => {

  test('robots.txt should be accessible and have correct sitemap URL', async ({ page }) => {
    await page.goto(`${BASE_URL}/robots.txt`);

    const content = await page.textContent('body');

    expect(content).toContain('User-agent: *');
    expect(content).toContain('Allow: /');
    expect(content).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
    expect(content).not.toContain('blog.qudange.top');
  });

  test('sitemap.xml should be accessible and valid XML', async ({ page }) => {
    // Use page.request to get raw XML without browser rendering
    const response = await page.request.get(`${BASE_URL}/sitemap.xml`);
    expect(response.status()).toBe(200);

    const content = await response.text();

    // Check it's served with correct content type
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('xml');

    // Check basic XML structure
    expect(content).toContain('<?xml version="1.0"');
    expect(content).toContain('<urlset');
    expect(content).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
  });

  test('sitemap.xml should contain expected pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/sitemap.xml`);

    const content = await page.content();

    // Should contain homepage
    expect(content).toContain(`${SITE_URL}/`);

    // Should contain blog posts
    expect(content).toContain(`${SITE_URL}/blogs/2025-02-01/`);

    // Should contain slides
    expect(content).toContain(`${SITE_URL}/slides/`);

    // Should NOT contain 404 page
    expect(content).not.toContain('/404');
  });

  test('sitemap.xml should have correct XML namespace and schema', async ({ page }) => {
    await page.goto(`${BASE_URL}/sitemap.xml`);

    const content = await page.content();

    // Check for proper schema declarations
    expect(content).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(content).toContain('xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"');
    expect(content).toContain('xsi:schemaLocation');
  });

  test('sitemap.xml URLs should have lastmod dates in ISO format', async ({ page }) => {
    await page.goto(`${BASE_URL}/sitemap.xml`);

    const content = await page.content();

    // Check for ISO 8601 date format (YYYY-MM-DDTHH:MM:SS.sssZ)
    const datePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g;
    const dates = content.match(datePattern);

    expect(dates).not.toBeNull();
    expect(dates.length).toBeGreaterThan(0);

    // Validate dates are parseable
    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      expect(date.toISOString()).toBe(dateStr);
    });
  });

  test('all URLs in sitemap should be accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/sitemap.xml`);

    // Extract all URLs from sitemap
    const urls = await page.evaluate(() => {
      const urlElements = document.querySelectorAll('url loc');
      return Array.from(urlElements).map(el => el.textContent);
    });

    expect(urls.length).toBeGreaterThan(0);

    // Test each URL is accessible (convert to localhost URLs)
    for (const siteUrl of urls) {
      const localUrl = siteUrl.replace(SITE_URL, BASE_URL);

      const response = await page.goto(localUrl);
      expect(response.status()).toBe(200);

      // Verify page has content
      const body = await page.textContent('body');
      expect(body.length).toBeGreaterThan(0);
    }
  });

  test('sitemap should not contain duplicate URLs', async ({ page }) => {
    await page.goto(`${BASE_URL}/sitemap.xml`);

    const urls = await page.evaluate(() => {
      const urlElements = document.querySelectorAll('url loc');
      return Array.from(urlElements).map(el => el.textContent);
    });

    const uniqueUrls = [...new Set(urls)];
    expect(urls.length).toBe(uniqueUrls.length);
  });

  test('sitemap URLs should use correct site base URL', async ({ page }) => {
    await page.goto(`${BASE_URL}/sitemap.xml`);

    const urls = await page.evaluate(() => {
      const urlElements = document.querySelectorAll('url loc');
      return Array.from(urlElements).map(el => el.textContent);
    });

    urls.forEach(url => {
      expect(url.startsWith(SITE_URL)).toBe(true);
      expect(url).not.toContain('localhost');
      expect(url).not.toContain('blog.qudange.top');
    });
  });

  test('sitemap should have proper XML structure with closing tags', async ({ page }) => {
    await page.goto(`${BASE_URL}/sitemap.xml`);

    const content = await page.content();

    // Check for proper XML structure
    expect(content).toContain('</urlset>');

    // Count opening and closing tags
    const urlOpenCount = (content.match(/<url>/g) || []).length;
    const urlCloseCount = (content.match(/<\/url>/g) || []).length;
    expect(urlOpenCount).toBe(urlCloseCount);

    const locOpenCount = (content.match(/<loc>/g) || []).length;
    const locCloseCount = (content.match(/<\/loc>/g) || []).length;
    expect(locOpenCount).toBe(locCloseCount);

    const lastmodOpenCount = (content.match(/<lastmod>/g) || []).length;
    const lastmodCloseCount = (content.match(/<\/lastmod>/g) || []).length;
    expect(lastmodOpenCount).toBe(lastmodCloseCount);
  });

  test('homepage should link to correct sitemap in robots.txt', async ({ page }) => {
    // Check that robots.txt is served at root
    const response = await page.goto(`${BASE_URL}/robots.txt`);
    expect(response.status()).toBe(200);

    const content = await page.textContent('body');

    // Verify it references the correct sitemap
    expect(content).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  test('sitemap should have appropriate priority values', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/sitemap.xml`);
    const content = await response.text();

    // Homepage should have highest priority
    expect(content).toContain('<priority>1.0</priority>');

    // Blog posts should have high priority
    expect(content).toContain('<priority>0.8</priority>');

    // All priorities should be between 0.0 and 1.0
    const priorityMatches = content.matchAll(/<priority>(.*?)<\/priority>/g);
    for (const match of priorityMatches) {
      const priority = parseFloat(match[1]);
      expect(priority).toBeGreaterThanOrEqual(0.0);
      expect(priority).toBeLessThanOrEqual(1.0);
    }
  });

  test('sitemap should have appropriate changefreq values', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/sitemap.xml`);
    const content = await response.text();

    // Valid changefreq values
    const validFreq = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

    const changefreqMatches = content.matchAll(/<changefreq>(.*?)<\/changefreq>/g);
    for (const match of changefreqMatches) {
      expect(validFreq).toContain(match[1]);
    }

    // Homepage should be updated weekly
    expect(content).toContain('<changefreq>weekly</changefreq>');

    // Blog and slides should be monthly
    expect(content).toContain('<changefreq>monthly</changefreq>');
  });

  test('sitemap should exclude unnecessary pages', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/sitemap.xml`);
    const content = await response.text();

    // Should not contain 404 page
    expect(content).not.toContain('/404');

    // Should not contain robots.txt
    expect(content).not.toContain('/robots.txt');

    // Should not contain sitemap.xml itself
    expect(content).not.toContain('/sitemap.xml</loc>');
  });
});
