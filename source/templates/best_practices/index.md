---
title: "Best Practices"
author: "virtualtraveler"
permalink: /best-practices/
---

<h1>{{ page.title }}</h1>

{% for practice in site.best_practices %}
<article>
    <hr>
    <h2 id="{{practice.id}}">{{ practice.title }}</h2>
    <div class="article-meta">
         <a href="{{ page.github-url }}{{ practice.author }}" class="post-author">
            <img src="{{ page.github-url }}{{ practice.author }}.png" class="avatar" alt="{{ practice.author }} avatar" width="24" height="24">
            {{ practice.author }}
         </a>	
         <span class="date">{{practice.publication-date}}</span>
    </div>
    <div class="article-content">
       {{ practice.content }}
    </div>
</article>

{% endfor %}