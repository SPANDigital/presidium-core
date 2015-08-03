---
title: "Reference" 
author: "virtualtraveler"
permalink: /references/
---

# {{ page.title }}

{% for reference in site.references %}
{{ reference.category }}:
<a href="{{ reference.url }}">{{ reference.title }} {{ reference.type }} {{ reference.categories }}</a>
{% endfor %}
