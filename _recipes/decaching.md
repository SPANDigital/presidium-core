---
title: "Decaching Multiple User Caches"
id: "de-caching" 
author: "dominicfollett"
---

# Solution

Users perform a GET for a resource against the PlayerPro API. If so
desired, the relationship between the entity and user may be recorded in
Redis for use at a later stage when the Job Service would be required
to invalidate all users who have a cached version of that resource.

Currently this relationship is determined by querying an external API.
In future a cache hook could easily query a redis store for this
information.

The first step to supporting this behaviour, is to adjust the Job
Service configuration rules to create a job from the events spawned as a
result of a GET against the PlayerPro API.

For the purposes of illustration, assume that the PlayerPro API caches
the GETs of ```posts```: ```GET /posts/<int:post_id>```, and this is
done per user. The cache keys in the Redis store will look like:
```/posts/<int:post_id>?access_token=users_access_token```.

The events that are pushed to the Job Service, can be converted into
jobs by using the following configuration:

{% highlight yaml lineos %}
job_scheduler:
  job_rules:
    # ...
    - { action_type: "^(Read)$", resource_type: "Posts", topic: "pp-cache" }
    # ...
    enricher:
    topics:
      pp-cache:
        - match:
            { action_type: "Read", resource_type: "Posts" }
          key_fields:
            - 'payload'
            - 'expires'
            - 'due'
            - 'priority'
            - 'job_type'
          job_properties:
              { superceedable: True, job_type: 'cache', priority: 1, due: 0, expires: 5 }
{% endhighlight %}

Above, the routing rule indicates that a cache related job needs to be
created. In the enricher config, a ```cache``` job is specified as the
job type, not ```invalidate```.

In the Job Manager, the cache hook can be adjusted to handle a
```cache``` job.

{% highlight python lineos %}
if job.job_type == 'invalidate':
    self.invalidate_cache(job)
    new_jobs = self.build_jobs(job, job_rules)
 elif job.job_type == 'cache':
    # Cache the relationship.
{% endhighlight %}

Here, the logic to retrieve the ```access_token``` and ```entity_id```
(Post Id), maybe be inserted. The job will have this information as part
of its attributes. The insertion mechanism will simply index by
```entity_id```, and return a list of access token's associated with
this list, new tokens can be appended to this list. and the result
cached.


# Discussion

This solution has some advantages over the incumbent: most importantly
it prevents the hook from having to query a slow API endpoint to
retrieve users associated with the resource. Moreover, it leverages
existing events produced by the PlayerPro API, and maintains the purity
of the API by not introducing work that is semantically different from
its intended purpose.
