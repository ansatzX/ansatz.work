# Sitemap 优化与测试文档

## 问题诊断

原始sitemap存在以下问题：
1. 测试失败：浏览器渲染XML时添加HTML样式包装，导致测试无法正确验证XML结构
2. 缺少优先级和更新频率：未为不同页面类型设置合适的priority和changefreq
3. 未排除不必要页面：robots.txt等文件不应出现在sitemap中

## 解决方案

### 1. 修复测试问题

**问题**：Playwright浏览器访问XML文件时，Chromium会自动添加HTML渲染样式，导致测试失败。

**解决方案**：使用 `page.request.get()` 获取原始XML内容，不经过浏览器渲染：

```javascript
// 修改前 - 失败
await page.goto(`${BASE_URL}/sitemap.xml`);
const content = await page.content(); // 包含浏览器渲染的HTML

// 修改后 - 成功
const response = await page.request.get(`${BASE_URL}/sitemap.xml`);
const content = await response.text(); // 原始XML
```

### 2. 增强Sitemap模板

**优化内容**：

- ✅ 自动URL排序（按URL字母顺序）
- ✅ 智能优先级分配：
  - 首页：priority=1.0, changefreq=weekly
  - 博客文章：priority=0.8, changefreq=monthly
  - 幻灯片：priority=0.7, changefreq=monthly
  - 其他页面：priority=0.5, changefreq=monthly
- ✅ 排除不必要页面：robots.txt, sitemap.xml自身
- ✅ 支持自定义覆盖：可在frontmatter中设置sitemap属性
- ✅ 格式化输出：清晰的缩进和换行

**模板代码** (`src/site/sitemap.njk`):
```nunjucks
{% for page in collections.all | sort(attribute='url') %}
    {% if page.url and page.url != '/404/' and page.url != '/404' and page.url != '/sitemap.xml' and page.url != '/robots.txt' %}
    <url>
        <loc>{{ meta.siteBaseUrl }}{{ page.url | url }}</loc>
        {% if page.date %}
        <lastmod>{{ page.date | dateToZulu }}</lastmod>
        {% endif %}
        {% if page.data.sitemap %}
            {# 使用自定义配置 #}
        {% else %}
            {# 自动分配默认值 #}
        {% endif %}
    </url>
    {% endif %}
{% endfor %}
```

### 3. Playwright测试套件

创建了全面的测试套件 (`tests/sitemap.spec.js`)，包含13个测试：

#### 基础验证
1. ✅ robots.txt可访问且包含正确sitemap URL
2. ✅ sitemap.xml可访问且为有效XML
3. ✅ 包含预期页面（首页、博客、幻灯片）
4. ✅ 正确的XML命名空间和schema

#### 数据质量
5. ✅ lastmod日期为ISO 8601格式
6. ✅ 所有URL可访问（200状态码）
7. ✅ 无重复URL
8. ✅ 使用正确的站点基础URL
9. ✅ 正确的XML结构和闭合标签

#### 高级验证
10. ✅ 首页在robots.txt中正确链接
11. ✅ 适当的优先级值（0.0-1.0之间）
12. ✅ 适当的changefreq值
13. ✅ 排除不必要页面（404、robots.txt等）

### 4. 验证脚本

创建了独立的验证脚本 (`scripts/validate-sitemap.js`)：

```bash
npm run validate:sitemap
```

**验证内容**：
- XML声明和命名空间
- URL格式和基础URL
- ISO 8601日期格式
- 优先级范围（0.0-1.0）
- 有效的changefreq值
- 统计信息（总URL数、按类型分类）

## 使用方法

### 运行测试
```bash
# 运行所有sitemap测试
npm run test:sitemap

# 运行所有playwright测试
npm run test:playwright

# 验证sitemap
npm run validate:sitemap
```

### 自定义页面配置

在页面的frontmatter中添加sitemap配置：

```yaml
---
sitemap:
  changefreq: daily
  priority: 0.9
---
```

## 测试结果

✅ **所有13个测试通过**

```
Running 13 tests using 1 worker
✓  1  robots.txt should be accessible
✓  2  sitemap.xml should be accessible and valid XML
✓  3  sitemap.xml should contain expected pages
✓  4  sitemap.xml should have correct XML namespace
✓  5  sitemap.xml URLs should have lastmod dates in ISO format
✓  6  all URLs in sitemap should be accessible
✓  7  sitemap should not contain duplicate URLs
✓  8  sitemap URLs should use correct site base URL
✓  9  sitemap should have proper XML structure
✓  10 homepage should link to correct sitemap in robots.txt
✓  11 sitemap should have appropriate priority values
✓  12 sitemap should have appropriate changefreq values
✓  13 sitemap should exclude unnecessary pages
```

## Sitemap统计

当前站点sitemap包含：
- **总URL数**：4
- **首页**：1 (priority: 1.0, changefreq: weekly)
- **博客文章**：1 (priority: 0.8, changefreq: monthly)
- **幻灯片**：2 (priority: 0.7, changefreq: monthly)
- **平均优先级**：0.80

## Playwright插件使用（方案B）

按照用户要求使用Playwright插件提取博客内容：

### 提取方法

```javascript
// 导航到博客页面
await page.goto('http://localhost:8080/blogs/2025-02-01/');

// 提取main标签内容，过滤script和style
const content = await page.evaluate(() => {
  const main = document.querySelector('main') || document.querySelector('article') || document.body;
  const clone = main.cloneNode(true);
  clone.querySelectorAll('script, style').forEach(el => el.remove());
  return clone.innerText;
});
```

**优势**：
- ✅ 只提取主要内容，忽略导航栏、页脚等
- ✅ 过滤所有`<script>`和`<style>`标签
- ✅ 获取纯文本，节省Token
- ✅ 内容已保存到 `blog_content.md`

## 技术栈

- **Eleventy 3.1.5** - 静态站点生成器
- **Playwright 1.58.2** - E2E测试框架
- **Nunjucks** - 模板引擎
- **Node.js ES Modules** - 模块系统

## 文件结构

```
.
├── src/site/
│   └── sitemap.njk          # Sitemap模板（已优化）
├── tests/
│   └── sitemap.spec.js      # Playwright测试（13个测试）
├── scripts/
│   └── validate-sitemap.js  # 独立验证脚本
├── dist/
│   └── sitemap.xml          # 生成的sitemap
└── blog_content.md          # 提取的博客内容
```

## SEO最佳实践

本sitemap实现遵循Google Sitemap协议最佳实践：

1. ✅ 正确的XML命名空间和schema
2. ✅ ISO 8601格式的lastmod时间戳
3. ✅ 合理的优先级分配（0.0-1.0）
4. ✅ 有意义的changefreq值
5. ✅ 规范的URL格式（绝对URL）
6. ✅ 排除不必要页面
7. ✅ 在robots.txt中声明sitemap

## 维护建议

1. **定期验证**：每次构建后运行 `npm run validate:sitemap`
2. **测试集成**：在CI/CD流程中运行 `npm run test:sitemap`
3. **内容更新**：添加新内容后自动出现在sitemap中
4. **自定义优先级**：重要页面可在frontmatter中设置更高优先级

## 参考资料

- [Sitemaps.org Protocol](https://www.sitemaps.org/protocol.html)
- [Google Search Console Sitemap Guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Playwright API Testing](https://playwright.dev/docs/api-testing)
