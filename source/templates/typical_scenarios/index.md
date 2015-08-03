---
title: "Typical Scenarios"
author: "virtualtraveler"
permalink: /typical-scenarios/
---

{% comment %}
    Things you should do when using the solution. A list of Best practices in the format: Recommended Practice, Discussion, See Also
{% endcomment %}

<div class="article-index">
<ul>
    {% for scenario in site.typical_scenarios %}
        <li>
            <a href="#{{ scenario.label-id }}">{{ scenario.title }}</a>
        </li>
    {% endfor %}
</ul>
</div>


# {{ page.title }}

{% for scenario in site.typical_scenarios %}
<article>
  <hr>
  <h2 id="{{scenario.label-id}}">{{ scenario.title }}</h2>
  <div class="article-meta">
      <a href="{{ page.github-url }}{{ scenario.author }}" class="post-author">
          <img src="{{ page.github-url }}{{ scenario.author }}.png" class="avatar" alt="{{ scenario.author }} avatar" width="24" height="24">
          {{ scenario.author }}</a>	
      <span class="date">{{scenario.publication-date}}</span>
  </div>
  <div class="article-content">
      {{ scenario.content }}
  </div>
</article>
{% endfor %}