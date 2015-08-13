---
title: "Cookbook" 
author: "virtualtraveler"
permalink: /cookbook/
---

<h1>{{ page.title }}</h1>

{% for recipe in site.recipes %}
<article>
    <hr>
    <h2 id="{{recipe.id}}">{{ recipe.title }}</h2>
    <div class="article-meta">
        <a href="{{ page.github-url }}{{ recipe.author }}" class="post-author">
        <img src="{{ page.github-url }}{{ recipe.author }}.png" class="avatar" alt="{{ recipe.author }} avatar" width="24" height="24">
        {{ recipe.author }}</a>	
        <span class="date">{{recipe.publication-date}}</span>
    </div>
    <div class="article-content">
        {{ recipe.content }}
    </div>
</article>
{% else %}
{% include empty-article.html %}
{% endfor %}