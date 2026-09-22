import test from 'node:test';
import assert from 'node:assert/strict';
import {pageSeo,dateModified,absoluteSiteUrl} from '../src/helpers/seo.js';
test('SEO uses explicit metadata, absolute encoded URLs and noindex without inventing modified dates',()=>{
 const seo=pageSeo({page:{url:'/notes/量子/'},meta:{siteBaseUrl:'https://ansatz.work/',siteName:'ansatz'},title:'A & B',description:'Explicit description',noindex:true},'# Heading\n\nFallback');
 assert.equal(seo.title,'A & B · ansatz');assert.equal(seo.description,'Explicit description');assert.equal(seo.canonical,'https://ansatz.work/notes/%E9%87%8F%E5%AD%90/');assert.equal(seo.noindex,true);assert.equal(seo.modified,'');
 assert.equal(dateModified('invalid'),'');assert.equal(absoluteSiteUrl('https://ansatz.work/','/img/social-card.png'),'https://ansatz.work/img/social-card.png');
});
test('SEO fallback extracts the heading and readable prose, excluding code and CSS',()=>{
 const seo=pageSeo({page:{url:'/note/',fileSlug:'2025-01-01'}},'# Research title\n\nA useful result.\n\n```css\nsecret code\n```\n<style>bad css</style>');
 assert.equal(seo.title,'Research title · ansatz');assert.match(seo.description,/A useful result/);assert.doesNotMatch(seo.description,/secret code|bad css/);
});
