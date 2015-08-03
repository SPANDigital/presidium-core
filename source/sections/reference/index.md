---
title: "Reference" 
author: "virtualtraveler"
permalink: /reference/
---

# {{ page.title }}

{% for reference_article in site.reference_articles %}
<article>
    <hr>
    <h2 id="{{reference_article.label-id}}">{{ reference_article.title }}</h2>
    <div class="article-meta">
        <a href="{{ page.github-url }}{{ reference_article.author }}" class="post-author">
        <img src="{{ page.github-url }}{{ reference_article.author }}.png" class="avatar" alt="{{ reference_article.author }} avatar" width="24" height="24">
        {{ reference_article.author }}</a>	
        <span class="date">{{reference_article.publication-date}}</span>
    </div>
    <div class="article-content">
        {{ reference_article.content }}
    </div>
</article>
{% endfor %}