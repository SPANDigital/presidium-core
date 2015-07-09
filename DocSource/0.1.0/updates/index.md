---
layout: basic-page
title: Updates
---

# Updates

## Index
<ul>
  {% for post in site.updates %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

##Notifications 

{% for post in site.updates %}
  {% include article.html %}
{% endfor %}