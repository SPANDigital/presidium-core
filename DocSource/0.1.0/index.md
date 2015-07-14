---
title: "Overview"
---
{% comment %}
The Overview section provides a short business level overview of what this solution does, including an explanation of the main benefits vs alternatives.
{% endcomment %}

# {{ page.title }}

<div class="navigation-items">
<ul>
  {% for section in site.data.sections %}
    <li>
      <a href="{{ section.path }}">{{ section.name }}</a>
		<ul>
	    {% for article in site[section.collection] %}
	      <li>
	        <a href="{{ section.path }}/#{{ article.label-id}}">{{ article.title }}</a>
	      </li>
	    {% endfor %}
		</ul>
    </li>
  {% endfor %}
</ul>
</div>

### Reason 1
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam sollicitudin ligula nisi, ac hendrerit purus semper vel. Mauris vitae ex congue, hendrerit nulla quis, finibus nisi. Vestibulum non metus a purus luctus iaculis. Maecenas dui augue, vehicula vitae semper eget, dictum vitae leo. Donec finibus odio ac purus consectetur, vulputate posuere nisl convallis. Pellentesque nisl purus, auctor eget lobortis eget, tincidunt porta lorem. Phasellus euismod magna a urna luctus, quis iaculis nisi fermentum. Donec ac porttitor libero. Fusce elementum, quam pulvinar commodo facilisis, diam mauris scelerisque quam, commodo bibendum sem ligula accumsan elit. Suspendisse potenti. Mauris tincidunt varius maximus. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam dictum nec nisi lobortis dignissim. Ut feugiat lorem tortor, convallis iaculis diam molestie a.

### Reason 2
Pellentesque id maximus quam, vel feugiat mi. Suspendisse vulputate eros eget mattis varius. Pellentesque faucibus nulla lectus, vitae mattis purus pulvinar non. Ut vel imperdiet diam. Vivamus a odio mattis nisl egestas feugiat. Aenean convallis magna at lobortis pulvinar. Nam ligula lacus, blandit vitae quam sagittis, mattis elementum elit. Nulla ut lacinia diam.

### Reason 3
Proin fringilla pellentesque augue faucibus congue. Phasellus eu nisi ut lorem lacinia posuere. Quisque eget sagittis turpis. Etiam elementum arcu ut posuere tempor. Nullam fermentum ac est vitae sollicitudin. Fusce faucibus ullamcorper nibh sit amet molestie. Sed pharetra leo vitae tellus elementum rhoncus id in leo. Suspendisse semper nisl sed felis lobortis efficitur. In at vestibulum ex.

