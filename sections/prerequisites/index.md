---
title: Prerequisites
permalink: /prerequisites/
---

<h1 class="primary">{{ page.title | upcase }}</h1>

{% for article in site.prerequisites %}
{{ article.content }}
{% else %}
{% include empty-article.html %}
{% endfor %}