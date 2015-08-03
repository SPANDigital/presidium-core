---
title: Reference
author: virtualtraveler
permalink: /references/
---


# {{ page.title }}


{% assign groups = site.references | group_by: "category" | sort_by: "name" %}

{% for group in groups %}

## {{ group.name }}

{% for item in group.items %}
<a href="{{ item.url }}">{{item.title}}</a>
{%endfor%}
  
{%endfor%}
