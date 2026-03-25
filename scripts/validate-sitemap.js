#!/usr/bin/env node

/**
 * Sitemap Validator Script
 * Validates sitemap.xml structure and URLs
 */

import { readFileSync } from 'fs';

const SITE_URL = process.env.SITE_BASE_URL || 'https://ansatz.work';

function validateSitemap() {
  const sitemapPath = './dist/sitemap.xml';

  try {
    const sitemapContent = readFileSync(sitemapPath, 'utf-8');

    console.log('✓ Sitemap file exists');

    // Validate XML declaration
    if (!sitemapContent.includes('<?xml version="1.0"')) {
      console.error('✗ Missing XML declaration');
      process.exit(1);
    }
    console.log('✓ XML declaration present');

    // Validate namespaces
    if (!sitemapContent.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')) {
      console.error('✗ Missing or incorrect sitemap namespace');
      process.exit(1);
    }
    console.log('✓ Correct sitemap namespace');

    // Extract URLs using regex
    const urlMatches = sitemapContent.matchAll(/<loc>(.*?)<\/loc>/g);
    const urls = Array.from(urlMatches, m => m[1]);

    console.log(`✓ Found ${urls.length} URLs in sitemap`);

    let hasErrors = false;
    const stats = {
      homepage: 0,
      blogs: 0,
      slides: 0,
      other: 0
    };

    urls.forEach((url, index) => {
      // Validate URL format
      if (!url.startsWith(SITE_URL)) {
        console.error(`✗ URL ${index + 1}: Incorrect base URL: ${url}`);
        hasErrors = true;
      }

      // Count by type
      if (url === `${SITE_URL}/`) {
        stats.homepage++;
      } else if (url.includes('/blogs/')) {
        stats.blogs++;
      } else if (url.includes('/slides/')) {
        stats.slides++;
      } else {
        stats.other++;
      }
    });

    // Validate lastmod dates
    const dateMatches = sitemapContent.matchAll(/<lastmod>(.*?)<\/lastmod>/g);
    const dates = Array.from(dateMatches, m => m[1]);
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    dates.forEach((date, index) => {
      if (!dateRegex.test(date)) {
        console.error(`✗ Invalid date format at index ${index}: ${date}`);
        hasErrors = true;
      }
    });

    if (hasErrors) {
      process.exit(1);
    }

    console.log('✓ All URLs validated successfully');
    console.log('✓ All dates in ISO 8601 format');

    // Validate priority values
    const priorityMatches = sitemapContent.matchAll(/<priority>(.*?)<\/priority>/g);
    const priorities = Array.from(priorityMatches, m => parseFloat(m[1]));

    priorities.forEach((priority, index) => {
      if (isNaN(priority) || priority < 0 || priority > 1) {
        console.error(`✗ Invalid priority at index ${index}: ${priority}`);
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      console.log('✓ All priority values valid (0.0-1.0)');
    }

    // Validate changefreq values
    const validFreq = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    const changefreqMatches = sitemapContent.matchAll(/<changefreq>(.*?)<\/changefreq>/g);
    const frequencies = Array.from(changefreqMatches, m => m[1]);

    frequencies.forEach((freq, index) => {
      if (!validFreq.includes(freq)) {
        console.error(`✗ Invalid changefreq at index ${index}: ${freq}`);
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      console.log('✓ All changefreq values valid');
    }

    if (hasErrors) {
      process.exit(1);
    }

    console.log('\n📊 Sitemap Statistics:');
    console.log(`   Total URLs: ${urls.length}`);
    console.log(`   Homepage: ${stats.homepage}`);
    console.log(`   Blog posts: ${stats.blogs}`);
    console.log(`   Slides: ${stats.slides}`);
    if (stats.other > 0) {
      console.log(`   Other: ${stats.other}`);
    }

    if (priorities.length > 0) {
      const avgPriority = (priorities.reduce((a, b) => a + b, 0) / priorities.length).toFixed(2);
      console.log(`   Average priority: ${avgPriority}`);
    }

    console.log('\n✅ Sitemap validation passed!');

  } catch (error) {
    console.error('✗ Error reading sitemap:', error.message);
    process.exit(1);
  }
}

validateSitemap();
