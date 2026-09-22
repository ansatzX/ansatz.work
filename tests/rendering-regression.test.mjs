import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarkdownIt } from '../src/helpers/markdown-plugins.js';
import buildFilters, { taggify, searchText } from '../src/helpers/eleventy-filters.js';
import buildTransforms from '../src/helpers/eleventy-transforms.js';

const markdown = createMarkdownIt();
test('production formulas preserve nested assistive CSS without coloring the parent transparent', async () => {
  const formula = markdown.render('A formula $q$ and #physics');
  const tagged = taggify(formula);
  assert.equal((tagged.match(/class="tag"/g) || []).length, 1);
  const transforms = {};
  buildTransforms({addTransform(name, fn) { transforms[name] = fn; }});
  process.env.ELEVENTY_ENV = 'prod';
  const result = await transforms.htmlMinifier(tagged, 'test.html');
  assert.match(result, /mjx-assistive-mml\s*\{/);
  assert.doesNotMatch(result, /#mjx-[^{}]+\{[^{}]*color\s*:/);
  assert.match(result, /<svg/);
});
test('search indexes prose and real tags, excluding styles and code', () => {
  const html = '<p>Spin &amp; bath #physics</p><style>#888 {color:#AAAAAA}</style><script>bad()</script><pre>#code</pre>';
  assert.equal(searchText(html), 'Spin & bath #physics');
  const filters = {};
  buildFilters({addFilter(name, fn) {filters[name] = fn;}});
  assert.deepEqual(filters.searchTags(html, ['physics', 'quantum']), ['physics', 'quantum']);
  const tagged = taggify(html);
  assert.match(tagged, /<style>#888 \{color:#AAAAAA\}<\/style>/);
  assert.match(tagged, /<pre>#code<\/pre>/);
});
