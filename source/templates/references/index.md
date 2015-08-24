---
title: Reference
author: virtualtraveler
permalink: /references/
---

<h1>{{ page.title | upcase }}</h1>

{% assign groups = site.references | group_by: "category" | sort_by: "name" %}
{% for group in groups %}

<h2 class="group-name">{{ group.name | upcase }}</h2>

{% for item in group.items %}
<!-- <a href="{{ item.url }}">{{ item.title }}</a> -->
  {{ item.content }}
{% endfor %}

{% else %}
  {% include empty-article.html %}
{% endfor %}
