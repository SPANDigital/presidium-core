---
title: "Updates" 
author: "virtualtraveler"
permalink: /updates/
---

<div class="article-index">
<ul>
  {% for update in site.updates %}
    <li>
      <a href="# {{ update.id }}">{{ update.title }}</a>
    </li>
  {% endfor %}
</ul>
</div>

# {{ page.title }}

{% for update in site.updates %}
<article>
  <h2 id="{{update.id}}">{{ update.title }}</h2>
  <div class="article-meta">
    <a href="{{ page.github-url }}{{ update.author }}" class="post-author">
      <img src="{{ page.github-url }}{{ update.author }}.png" class="avatar" alt="{{ update.author }} avatar" width="24" height="24">
      {{ update.author }}</a>	
	<span class="date">{{update.publication-date}}</span>
  </div>
  <div class="article-content">
    {{ update.content }}
  </div>
</article>
{% endfor %}