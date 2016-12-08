---
title: "Key Concepts"
id: "key-concepts" 
author: "dominicfollett"
---

# Job Service

## Job Scheduler

The Job Scheduler consumes events and creates jobs from them, these are
then published to their respective job queues.

![Job Scheduler](/assets/local/images/ppro_job_scheduler.svg)

An Event Consumer polls the bus, and retrieves messages of the the Kafka 
queue. The event is passed to a Router module which determines (as per
the configuration) what jobs are to be created from this event. For each
type of job, the event is passed into the enricher module to be
converted into a job. Configuration rules supplied to the Job
Scheduler determine the kinds of properties each job has - e.g. expiry
time, priority level, due date, etc. Finally, the Job Publisher
publishes each job to the correct topic queue it belongs.

## Job Manager

In the Job Manager, Job Consumers consume jobs from each topic queue and
process them before dispatching them to their respective hooks.

![Job Manager](/assets/local/images/ppro_job_manager.svg)

### Prioritization

Prioritization, the first module in the Job Manager pipeline, ensures
that higher priority jobs receive a greater share of resources than
lower priority jobs.

![Pioritization](/assets/local/images/ppro_prioritization.svg)

Each topic queue has a set of Kafka Consumers per priority level range.
Each of these Kafka Consumers uses a separate Consumer Group, such that
every job is read once by a Kafka Consumer but is only processed if the
job priority level matches the Kafka Consumer priority rang.
Each Kafka Consumer has a pool of Job Consumer workers, higher priority
Kafka Consumers have more workers in their pool than lower priority
Kafka Consumer. This means that the amount of available resources
provided is a function of priority range.

### Job Expiration

Each job that reaches the Expirer has an expiry that is set in the Job
Scheduler. If the job has expired, it is dropped and no further
processing occurs.

### Deduplication

![Deduplication](/assets/local/images/ppro_deduplication.svg)

The mechanism of job deduplication relies on a unique job hash which is
generated at the enricher stage in the Job Scheduler. Configuration
rules dictate what job fields form part of the unique job hash. Once a
job reaches the deduper, its unique hash is used as a key in a Redis
store  to determine if the job has already been processed. If the Job
has not already been processed, the deduper, inserts the unique job
hash, and provides an expiry time based on configuration rules supplied
to the Job Manager.

This method of deduplication is able to cover duplicates arising from
the three causes discussed below.

#### Three Ways Duplicates Occur

![Three Mechanisms](/assets/local/images/ppro_three_causes_of_duplication.svg)

1. A Job Publisher does not receive an ACK due to a
   network error, and continues to publish a job repeatedly.
2. A Consumer crashes.
3. Identical events produce the same kind of job.

### Dispatch

If the job is not expired and is not a duplicate, the Dispatcher passes
it on to the appropriate hook so that the job can be completed. Some
hooks might produce other jobs as a by-product.

### Job Publisher

Within the context of the Job Manager, the Job Publisher will publish
jobs that are the result of a hook creating new jobs from jobs it has
processed. The Job Publisher updates a generational count on a job to
prevent a 'combinatorial explosion' of job creation. Jobs that exceed a
set generational count are discarded.

# PlayerPro API

## System Context

![API System Context](/assets/local/images/ppro_api_system_context.svg)

## Caching Middleware

In the PlayerPro API, in order to provide significant performance
improvements a flexible caching middleware has been added. The Caching
Middleware supports the three main semantics of cache usage: get, set
and delete.

## Cache Configuration Design

A cache decorator is applied on all endpoints in API, this done by
adding it to the Flask Resource method_decorators array field:

```python
method_decorators = [authenticate, handle_error, cache()]
```

The Cache Middleware is bypassed if no entry in the config matches the
endpoint's HTTP method and url path.

### Cache Config Format

Caching in the PlayerPro API relies on rules to determine how an
endpoint should be cached, the mechanisms around this are displayed
below, and covered briefly as follows:

```json
{  
   "<METHOD>/path/":{  
      "defaults":{  
         "action":"<cache> || <invalidate>",
         "session":"<bool>",
         "expires":"<milliseconds ms>",
         "xx":"<bool>",
         "nx":"<bool>"
      },
      "overrides":{  
         "rules":[  
            {  
               "rule":"<rule>",
               "action":"<cache> ||<invalidate>",
               "session":"<bool>",
               "expires":"<milliseconds ms>",
               "etc":"etc"
            }
         ]
      }
   }
}
```

### Cache Logic

![Cache Configuration](/assets/local/images/ppro_cache_logic_flow.svg)


### Rules

1. The structure of a rule pattern is:
    ```<query_param>:<value>&<query_param>:<value>&<query_param>:<value>...```
    Where value is a single word, a comma separated list, or the
    ```*``` wildcard. E.g. ```'type:Group&id:*'```
2. If no rules are supplied for an endpoint then then the API uses any
    defaults that may be available.
3. If a rule is specified, then only APIv2 calls that agree with the
    rule are cached. If there are more query parameters e.g. 'filter_by'
    that are not specified in the rule, then defaults are used. 
4. Rules must be fully scoped. If a query parameter relies on another
    query parameter in the url string for meaning, then it must be
    included in the scope of the rules. E.g. ```type=Group``` relies on
    ```id=<id>```.
5. Rules are passed a list of strings. The cache key is simply the
    request url, with any query parameters re-arranged in alphabetical
    order, and the values for those query parameters also ordered
    alphabetically.

### Rational For Rules

If we explicitly mark an endpoint for caching, we need to be able to
differentiate between what is to be cached and what is not to be cached,
especially in the case of complex endpoints such as GET /posts where
query parameters effectively change the endpoint definition.

Merely caching by endpoint url doesn’t allow us to stop caching in
certain cases - perhaps we don’t want to cache anything with ‘filter_by’
in it. Hence, the need to introduce rules.

The burden of responsibility is on the shoulders of the programmer to
clearly define which endpoints are to be cached, by being explicit about
the HTTP method and the url path expected.

### A Note On Access Tokens

A note on use of ```access_token``` query parameter:

The ```access_token``` parameter is present on some PlayerPro API
endpoints (this is strongly advised against by the
[Oauth2 RFC](https://tools.ietf.org/html/rfc6750#page-13)), when caching
by user, if the ```access_token```  does not exist on the url, then it
will be pulled from the request header. If no ```access_token``` is
found, then the cache is bypassed. The access token query parameter is
always ignored when checking the rules supplied for the endpoint match
the url’s query parameters.

