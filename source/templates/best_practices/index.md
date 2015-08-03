---
title: Best Practices
permalink: /best-practices/
---

<div class="page-header">
    <h1>{{ page.title }}</h1>
</div>
<div class="row">
    <div class="article-index">
        <ul>
            {% for practice in site.best_practices %}
                <li>
                    <a href="#{{ practice.id }}">{{ practice.title }}</a>
                </li>
            {% endfor %}
        </ul>
    </div>
</div>

{% for practice in site.best_practices %}
<div class="row">
    <article>
        <hr>
        <h2 id="{{practice.label-id}}">{{ practice.title }}</h2>
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
</div>
{% endfor %}