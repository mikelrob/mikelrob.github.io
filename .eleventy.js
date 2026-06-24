const pluginRss = require('@11ty/eleventy-plugin-rss');

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function asDate(value) {
  return value instanceof Date ? value : new Date(value);
}

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addPassthroughCopy({
    'style.css': 'style.css',
    'analytics.js': 'analytics.js',
    icons: 'icons',
    CNAME: 'CNAME',
  });

  eleventyConfig.addCollection('posts', (collectionApi) => {
    return collectionApi
      .getFilteredByGlob('src/blog/posts/**/*.md')
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection('tagList', (collectionApi) => {
    const tags = new Set();

    for (const post of collectionApi.getFilteredByGlob('src/blog/posts/**/*.md')) {
      for (const tag of post.data.tags || []) {
        tags.add(tag);
      }
    }

    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  });

  eleventyConfig.addFilter('absoluteUrl', (url, base) => new URL(url, base).href);
  eleventyConfig.addFilter('dateIso', (value) => asDate(value).toISOString());
  eleventyConfig.addFilter('htmlDateString', (value) => asDate(value).toISOString().split('T')[0]);
  eleventyConfig.addFilter('limit', (array, count) => array.slice(0, count));
  eleventyConfig.addFilter('readableDate', (value) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      timeZone: 'UTC',
      year: 'numeric',
    }).format(asDate(value));
  });
  eleventyConfig.addFilter('slugify', slugify);
  eleventyConfig.addFilter('sortByDateDesc', (collection) => {
    return Array.from(collection).sort((a, b) => b.date - a.date);
  });
  eleventyConfig.addFilter('tagUrl', (tag) => `/tags/${slugify(tag)}/`);
  eleventyConfig.addFilter('xmlEscape', xmlEscape);

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
};
