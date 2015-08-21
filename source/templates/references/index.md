---
title: Reference
author: virtualtraveler
permalink: /references/
---

<h1>{{ page.title }}</h1>

{% assign groups = site.references | group_by: "category" | sort_by: "name" %}
{% for group in groups %}

<h2 class="group-name">{{ group.name }}</h2>

{% for item in group.items %}
<!-- <a href="{{ item.url }}">{{ item.title }}</a> -->
  {{ item.content }}
<hr/>
{%endfor%}

{% else %}
  {% include empty-article.html %}
{%endfor%}
