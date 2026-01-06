---
layout: page
title: 文章归档
subtitle: 所有文章按时间和分类整理，方便检索
permalink: /pages/archive/
last_modified_at: 2026-01-06
---

### 归档说明
本页面汇总了博客中所有的文章，你可以通过时间维度或分类维度快速找到感兴趣的内容。所有文章均为原创，未经授权禁止转载。如果发现内容有误，欢迎通过联系方式指出，我会及时修正。

### 按时间归档
{% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
{% if posts_by_year.size > 0 %}
{% for year in posts_by_year %}
<h3>{{ year.name }}年</h3>
<ul>
{% assign posts_by_month = year.items | group_by_exp: "post", "post.date | date: '%m'" %}
{% for month in posts_by_month %}
<li style="margin-bottom: 1.5rem;">
<strong>{{ month.name }}月</strong>
<ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
{% for post in month.items %}
<li style="margin-bottom: 0.8rem;">
<a href="{{ post.url | relative_url }}" style="color: var(--accent); text-decoration: none;">
{{ post.title }}
</a>
<span style="color: var(--secondary); font-size: 0.9rem; margin-left: 1rem;">
({{ post.date | date: '%Y-%m-%d' }})
</span>
{% if post.excerpt %}
<p style="margin-top: 0.5rem; margin-left: 0; color: var(--secondary); font-size: 0.9rem; line-height: 1.6;">
{{ post.excerpt | strip_html | truncate: 100 }}
</p>
{% endif %}
</li>
{% endfor %}
</ul>
</li>
{% endfor %}
</ul>
{% endfor %}
{% else %}
  <p>暂无文章归档，博主正在努力创作中，敬请期待！</p>
{% endif %}

{% assign categories = site.posts | map: 'categories' | flatten | uniq %}
{% if categories.size > 0 %}
<h3>按分类查看</h3>
  <ul>
    {% for category in categories %}
      <li style="margin-bottom: 1.5rem;">
        <strong>{{ category }}</strong>
        <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
          {% assign posts_in_category = site.posts | where: 'categories', category %}
          {% for post in posts_in_category %}
            <li style="margin-bottom: 0.8rem;">
              <a href="{{ post.url | relative_url }}" style="color: var(--accent); text-decoration: none;">
                {{ post.title }}
              </a>
              <span style="color: var(--secondary); font-size: 0.9rem; margin-left: 1rem;">
                ({{ post.date | date: '%Y-%m-%d' }})
              </span>
            </li>
          {% endfor %}
        </ul>
      </li>
    {% endfor %}
  </ul>
{% else %}
  <p>暂无分类归档，所有文章均为未分类状态。</p>
{% endif %}

{% assign tags = site.posts | map: 'tags' | flatten | uniq %}
{% if tags.size > 0 %}
<h3>按标签查看</h3>
  <div style="display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem;">
    {% for tag in tags %}
      <div style="background-color: var(--light-gray); padding: 0.5rem 1rem; border-radius: 20px;">
        <strong>{{ tag }}</strong>
        <ul style="margin-left: 1rem; margin-top: 0.5rem;">
          {% assign posts_in_tag = site.posts | where: 'tags', tag %}
          {% for post in posts_in_tag %}
            <li style="margin-bottom: 0.5rem;">
              <a href="{{ post.url | relative_url }}" style="color: var(--accent); text-decoration: none; font-size: 0.9rem;">
                {{ post.title }}
              </a>
            </li>
          {% endfor %}
        </ul>
      </div>
    {% endfor %}
  </div>
{% else %}
  <p>暂无标签归档，所有文章均未添加标签。</p>
{% endif %}

### 使用提示
1. **检索技巧**：你可以使用浏览器的查找功能（Ctrl+F / Command+F）快速检索文章标题或关键词。
2. **更新频率**：归档页面会自动同步最新的文章，无需手动更新，所有内容均由Jekyll自动生成。
3. **历史版本**：如果文章有更新，归档页面会显示最新的发布时间，历史版本可通过GitHub提交记录查看。
4. **访问优化**：为了提升访问速度，归档页面采用了懒加载和轻量化渲染，在移动端也能快速加载。

如果你在使用归档页面时遇到任何问题，或者有更好的归档方式建议，欢迎通过<a href="mailto:{{ site.author.email }}" style="color: var(--accent);">邮箱</a>告诉我。