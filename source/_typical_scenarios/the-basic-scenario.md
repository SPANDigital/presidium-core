---
title: "The Basic Scenario"
id: "the-basic-scenario"
author: "virtualtraveler"
---

## Scenario Context 
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book

## Implementation Example 

{% highlight python linenos %}
import urllib
import re

print "we will try to open this url, in order to get IP Address"
url = "http://checkip.dyndns.org"
print url
request = urllib.urlopen(url).read()
theIP = re.findall(r"\d{1,3}\.\d{1,3}\.\d{1,3}.\d{1,3}", request)
print "your IP Address is: ",  theIP
{% endhighlight %}


## Discusion
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

## Conceptual Diagram 

