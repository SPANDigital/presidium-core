---
title: "Best Practices"
author: "virtualtraveler"
---
{% comment %}
Things you should do when using the solution. A list of Best practices in the format: Recommended Practice, Discussion, See Also
{% endcomment %}

<div class="article-index">
<ul>
  {% for practice in site.best-practices %}
    <li>
      <a href="#{{ practice.label-id }}">{{ practice.title }}</a>
    </li>
  {% endfor %}
</ul>
</div>

# {{ page.title }}

{% for practice in site.best-practices %}
<article>
  <hr>
  <h2 id="{{practice.label-id}}">{{ practice.title }}</h2>
  <div class="article-meta">
    <a href="{{ page.github-url }}{{ practice.author }}" class="post-author">
      <img src="{{ page.github-url }}{{ practice.author }}.png" class="avatar" alt="{{ practice.author }} avatar" width="24" height="24">
      {{ practice.author }}</a>	
	<span class="date">{{practice.publication-date}}</span>
  </div>
  <div class="article-content">
    {{ practice.content }}
  </div>
</article>
{% endfor %}