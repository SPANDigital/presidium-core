---
title: "Cookbook" 
author: "virtualtraveler"
permalink: /cookbook/
---

<div class="article-index">
    <ul>
        {% for recipe in site.recipes %}
            <li>
                <a href="#{{ recipe.label-id }}">{{ recipe.title }}</a>
            </li>
        {% endfor %}
    </ul>
</div>


# {{ page.title }}

{% for recipe in site.recipes %}
<article>
    <hr>
    <h2 id="{{recipe.label-id}}">{{ recipe.title }}</h2>
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
{% endfor %}