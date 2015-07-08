---
layout: journal
title: Cookbook
---

### Cookbook

#### Index
<ul>
  {% for post in site.categories.recipie %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

####Recipies 

{% for post in site.categories.recipie %}
  {% include article.html %}
{% endfor %}