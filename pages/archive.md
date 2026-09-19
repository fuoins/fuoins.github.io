---
layout: page
title: 文章归档
subtitle: 所有文章按时间整理，方便检索
permalink: /pages/archive/
last_modified_at: 2026-01-06
---

<div class="archive-cats">
  {% assign categories = site.posts | map: 'categories' | flatten | uniq %}
  {% if categories.size > 0 %}
    {% for category in categories %}
    <span class="tag">{{ category }}</span>
    {% endfor %}
  {% endif %}
</div>

{% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}
{% if posts_by_year.size > 0 %}
  {% for year in posts_by_year %}
  <section class="archive-year">
    <h2>{{ year.name }}</h2>
    <ul class="archive-list">
      {% for post in year.items %}
      <li>
        <time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: '%m-%d' }}</time>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </li>
      {% endfor %}
    </ul>
  </section>
  {% endfor %}
{% else %}
  <p>暂无文章，博主正在努力创作中，敬请期待！</p>
{% endif %}
