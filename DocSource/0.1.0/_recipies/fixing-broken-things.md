---
title: "Fixing Broken Things"
label-id: "fixing-broken-things"
publication-date: "2015-07-14 14:00:00"
author: "virtualtraveler"
---
### Solution

{% highlight python lineos %}
    def readints(prompt):
    '''Read a line of integers and return the list of integers.'''

    # Read a line
    line = raw_input(prompt)
    if line == 'quit': sys.exit(0)
            
    # Go through each item on the line, converting each one and adding it
    # to retval.
    retval = [ ];
    for str in string.split(line):
        try:
            retval.append(int(str))
        except ValueError:
            # On conversion failure, whine and return empty list.
            print 'Conversion of', str, 'failed.'
            return []

    return retval
{% endhighlight %}

### Discusion

Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, rema ining essen tially uncha nged. It was popularised in the 1960s with the release of Let raset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker inclu ding versions of Lorem Ipsum.

### See Also

- A
- B
- C 