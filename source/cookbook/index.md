---
title: "Cookbook" 
author: "virtualtraveler"
---

<div class="article-index">
    <ul>
        {% for recipie in site.recipies %}
            <li>
                <a href="#{{ recipie.label-id }}">{{ recipie.title }}</a>
            </li>
        {% endfor %}
    </ul>
</div>


# {{ page.title }}

{% for recipie in site.recipies %}
    <article>
        <hr>
        <h2 id="{{recipie.label-id}}">{{ recipie.title }}</h2>
        <div class="article-meta">
            <a href="{{ page.github-url }}{{ recipie.author }}" class="post-author">
            <img src="{{ page.github-url }}{{ recipie.author }}.png" class="avatar" alt="{{ recipie.author }} avatar" width="24" height="24">
            {{ recipie.author }}</a>	
            <span class="date">{{recipie.publication-date}}</span>
        </div>
        <div class="article-content">
            {{ recipie.content }}
        </div>
    </article>
{% endfor %}