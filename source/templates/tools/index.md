---
title: "Tools"
author: "virtualtraveler"
permalink: /tools/
---

{% comment %}
    A list of tools commonly used with the solution
{% endcomment %}

# {{ page.title }}

{% for tool in site.tools %}
  <article>
      <hr>
      <h2 id="{{ tool.id }}">{{ tool.title }}</h2>
      <div class="article-meta">
          <a href="{{ page.github-url }}{{ scenario.author }}" class="post-author">
              <img src="{{ page.github-url }}{{ scenario.author }}.png" class="avatar" alt="{{ scenario.author }} avatar" width="24" height="24">
              {{ scenario.author }}</a>	
          <span class="date">{{scenario.publication-date}}</span>
      </div>
      <div class="article-content">
          {{ tool.content }}
      </div>
  </article>
{% else %}
{% include empty-article.html %}
{% endfor %}