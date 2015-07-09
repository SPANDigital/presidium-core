---
layout: basic-page
title: Cookbook
---

# Cookbook

## Index
<ul>
  {% for post in site.recipies %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

##Recipies 

{% for post in site.recipies %}
  {% include article.html %}
{% endfor %}