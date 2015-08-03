---
title: Getting Started
permalink: /getting-started/
---

{% comment %}
    How to get started with the solution
{% endcomment %}


# {{ page.title }}


{% for article in site.getting_started %}
{{ article.content }}
{% endfor %}