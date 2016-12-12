---
title: "Key Concepts"
id: "key-concepts" 
author: "dominicfollett"
---

# Contents

- [Job Service](#job-service)
  * [Job Scheduler](#job-scheduler)
  * [Job Manager](#job-manager)
    + [Prioritization](#prioritization)
    + [Job Expiration](#job-expiration)
    + [Deduplication](#deduplication)
      - [Three Ways Duplicates Occur](#three-ways-duplicates-occur)
    + [Dispatch](#dispatch)
    + [Job Publisher](#job-publisher)
  * [The Config File](#the-config-file)
    + [Kafka Connection Settings For Producers And Consumers](#kafka-connection-settings-for-producers-and-consumers)
    + [Job Scheduler Consumer Groups](#job-scheduler-consumer-groups)
    + [Job Scheduler Routing Rules](#job-scheduler-routing-rules)
    + [Job Scheduler Job Creation (Enrichment Rules)](#job-scheduler-job-creation-enrichment-rules)
    + [Job Manager Job Consumer Config](#job-manager-job-consumer-config)
- [PlayerPro API](#playerpro-api)
  * [System Context](#system-context)
  * [Caching Middleware](#caching-middleware)
  * [Cache Configuration Design](#cache-configuration-design)
    + [Cache Config Format](#cache-config-format)
    + [Cache Logic](#cache-logic)
    + [Rules](#rules)
    + [Rational For Rules](#rational-for-rules)
    + [A Note On Access Tokens](#a-note-on-access-tokens)


- [PlayerPro API](#playerpro-api)
  * [System Context](#system-context)
  * [Caching Middleware](#caching-middleware)
  * [Cache Configuration Design](#cache-configuration-design)
    + [Cache Config Format](#cache-config-format)
    + [Cache Logic](#cache-logic)
    + [Rules](#rules)
    + [Rational For Rules](#rational-for-rules)
    + [A Note On Access Tokens](#a-note-on-access-tokens)


# Job Service

## Job Scheduler

The Job Scheduler consumes events and creates jobs from them, these are
then published to their respective job queues.

![Job Scheduler]({{ "/assets/local/images/ppro_job_scheduler.svg" | relative_url }})

An Event Consumer polls the bus, and retrieves messages of the the Kafka 
queue. The event is passed to a Router module which determines (as per
the configuration) what jobs are to be created from this event. For each
type of job, the event is passed into the enricher module to be
converted into a job. Configuration rules supplied to the Job
Scheduler determine the kinds of properties each job has - e.g. expiry
time, priority level, due date, etc. Finally, the Job Publisher
publishes each job to the correct topic queue.

## Job Manager

In the Job Manager, Job Consumers consume jobs from each topic queue and
process them before dispatching them to their respective hooks.

![Job Manager]({{ "/assets/local/images/ppro_job_manager.svg" | relative_url }})

### Prioritization

Prioritization, the first module in the Job Manager pipeline, ensures
that higher priority jobs receive a greater share of resources than
lower priority jobs.

![Job Manager Prioritization]({{ "/assets/local/images/ppro_prioritization.svg" | relative_url }})

Each topic queue has a set of Kafka Consumers per priority level range.
Each of these Kafka Consumers uses a separate Consumer Group, such that
every job is read once by a Kafka Consumer but is only processed if the
job priority level matches the Kafka Consumer priority range.
Each Kafka Consumer has a pool of Job Consumer workers, higher priority
Kafka Consumers have more workers in their pool than lower priority
Kafka Consumers. This means that the amount of available resources
provided is a function of priority range.

### Job Expiration

Each job that reaches the Expirer has an expiry that is set in the Job
Scheduler. If the job has expired, it is dropped and no further
processing occurs.

### Deduplication

![Deduplication]({{ "/assets/local/images/ppro_deduplication.svg" | relative_url }})

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

![Three Mechanisms]({{ "/assets/local/images/ppro_three_causes_of_duplication.svg" | relative_url }})

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
jobs that are sent to it from a hook. The Job Publisher updates a
generational count on a job to prevent a 'combinatorial explosion' of
jobs. Jobs that exceed a set generational count are discarded.

## The Config File

### Kafka Connection Settings For Producers And Consumers

```yaml
kafka:
  # This section contains default kafka settings for all consumers and producers.
  consumer:
    # For available settings, refer to http://kafka-python.readthedocs.io/en/master/apidoc/KafkaConsumer.html
    bootstrap_servers:
      - 'localhost:9090'
      - 'localhost:9091'
      - 'localhost:9092'
    enable_auto_commit: False
  producer:
    # For available settings, refer to http://kafka-python.readthedocs.io/en/master/apidoc/KafkaProducer.html
    bootstrap_servers:
      - 'localhost:9090'
      - 'localhost:9091'
      - 'localhost:9092'

```

### Job Scheduler Consumer Groups

```yaml
job_scheduler:
  kafka:
    # This section contains kafka configuration for job_scheduler consumer and producer.
    consumer:
      # For available settings, refer to http://kafka-python.readthedocs.io/en/master/apidoc/KafkaConsumer.html
      group_id: 'pp-evnt-cnsmr-grp'
      client_id: 'pp-evnt-cnsmr-clnt'
    producer:
      # For available settings, refer to http://kafka-python.readthedocs.io/en/master/apidoc/KafkaProducer.html
      client_id: 'pp-job-prdcr-clnt'
```
The same information is supplied under the ```job_manager``` section.

### Job Scheduler Routing Rules

By matching against a resource type and action type, the Job Scheduler
can determine the kinds of jobs that need to be created. For example, in
the snippet below if the event has a resource type of ```PostsById```
and an action type of either ```Create```, ```Update``` or  ```Delete```
then a cache-related job will be created.

```yaml
job_scheduler:
  job_rules:
    # ...
    - { action_type: "^(Create|Update|Delete)$", resource_type: "PostsById", topic: "pp-cache" }
    # ...
```

### Job Scheduler Job Creation (Enrichment Rules)

For a particular topic, candidate events are matched again by resource
type and action type, providing a lower level of granularity with 
respect to the kinds of jobs (and their properties) that can be created.
In the snippet below, under the topic of ```pp-cache```, for an
```Update``` of ```PostsById```, the ```key_fields``` are those job
fields which must be used as the 'plaintext' for unique hash generation.
The ```job_properties``` dictionary, specifies certain attributes of the
job, such as when it expires (5 min from now), or when it is due
(immediately), or that this particular job type is an invalidation etc.

```yaml
job_scheduler:
  # ...
enricher:
topics:
  pp-cache:
    - match:
        { action_type: "Update", resource_type: "PostsById" }
      key_fields:
        - 'payload'
        - 'expires'
        - 'due'
        - 'priority'
        - 'job_type'
      job_properties:
          { superceedable: True, job_type: 'invalidate', priority: 1, due: 0, expires: 5 }
common:
  - match:
      { action_type: "Read", resource_type: "Heartbeat" }
    key_fields:
      - timestamp
      - job_type
    job_properties:
        { superceedable: False, job_type: 'Heartbeat', priority: 1, due: 0, expires: 5 }
defaults:
    job_properties:
        { job_type: 'invalidate', due: 0, expires: 5, priority: 1, superceedable: False, retry_limit: 3 }
```

The ```common``` section applies to any topic, and in this case matches a
```Heartbeat Read```, thus across any topic, heartbeats have the same
```key_fields``` and ```job_properties```.

### Job Manager Deduplication Config

```yaml
deduper:
  # the amount of time in milliseconds to store a job hash
  unique_id_expiry: 60000
```

An unseen job's unique hash will be cached for the specified time.

### Job Manager Generational Count Config

```yaml
job_publisher:
  generations_limit: 3
```

Generational limit can be lowered or increased as required. High
generational counts are not recommended as this may induce a
'combinatorial explosion' in the service. The purpose of allowing
second or third generation jobs, is specifically to support cases where
job side effects need to be processed. It does not make sense to create
a separate topic and hook to handle these jobs - especially when they
exist within the same semantic space of the current topic, e.g. caching.
Additionally, such jobs do not have their own 'source of truth' like
other jobs do - the knowledge that another job needs to be created is in
effect inferred from a job and not an event in this case.

### Job Manager Feed & Cache Manager Sections

```yaml
feed_manager:
  worker_url: 'http://localhost:8000?type={type}&id={id}'

cache_manager:
  ppro_user_id/token_endpoint: 'http://remote_url/post/affected_users/FNwDuWV98ZiwfvOUB9Tx?type={type}&id={id}
  redis_url: 'redis://localhost:6379/'
```

These sections provide the hook with extra information it might need to
complete its task. For example, the cache hook queries an endpoint to
retrieve all users affected by an invalidation with respect to some
resource.

### Job Manager Creating Generational Jobs Config

If new cache jobs need to be created, the config for doing so is placed
under the ```cache_manager``` heading.

```yaml
rules:
- match:
    { action_type: "Update", resource_type: "PostsById", job_type: 'invalidate' }
  jobs:
    - { others_affected: True, entity_type: 'Post', entity_id_offset: 1, params: {type: 'type', id: 'entity'},  topic: 'pp-cache', update_fields: { superceedable: True, job_type: 'invalidate', priority: 1, due: 0, expires: 5} }
- match:
    { action_type: "Update", resource_type: "Post", job_type: 'invalidate' }
  jobs:
      # type and id in the source url corresponds to type and entity in the external api call respectively.
      # params is a dict with params to look at on the source url, with a mapping between the job service
      # and ppro's api endpoint. others_affected indicates to the hook that an external api must be queried to find
      # data for new jobs to be created.
      # Adding entity_type and entity_id_offset tells the cache hook to look at the url path to get the entity ID.
      # e.g. entity_type: Post, entity_id_offset: 1 -- /posts/<int:post_id>
      - { others_affected: True, params: {type: 'type', id: 'entity'},  topic: 'cache', update_fields: { superceedable: True, job_type: 'invalidate', priority: 1, due: 0, expires: 5} }
      - { others_affected: False, topic: 'feed', update_fields: { superceedable: False, job_type: 'feed', priority: 1, due: 0, expires: 5} }
      - { others_affected: False, topic: 'cache', update_fields: { superceedable: False, job_type: 'invalidate', priority: 1, due: 0, expires: 5} }
```

The cache hook matches the current job against resource, action and job
type. If a match exists, the config specifies information required to
assist in job generation. In this case for and Update to PostsById, we
have a new kind of job to create. Below is a list if attributes and
their meaning:

1. ```others_affected``` this tells the hook that there is a set of jobs
    that need to be created - which prompts it to call the external API.
2. ```entity_type``` is the type of entity associated with this resource
    type.
3. ```entity_id_offset``` is the position in the ```resource_url``` path
    that provides the the entity id.
4. ```params``` indicate which query parameters on the 'resource_url'
    provide the ```type``` and ```entity_id``` - required for calling
    the API.
    The dictionary here is actually to provide a mapping between the
    query parameter names in the ```resource_url``` and the query
    parameter names in the API call, which are different.
5.  ```topic```  - the job queue these new jobs will be published to.
6.  ```update_fields```  are the ob fields that need to be updated with
    the specified values. A new job inherits the parent's attributes,
    this mechanism allows for that to be overridden.

Note that ```entity_type``` and ```entity_id_offset``` are used when the
```resource url``` does not have any query parameters. The ```params```
dictionary is used when query parameters exist.

This may appear

### Job Manager Job Consumer Config

```yaml
job_consumers:
  - name: 'Mock Job Consumer'
    topics:
      - 'pp-mock'
    serializing_function: ppro.models.event.Event.deserialize
    hook: ppro.job_manager.hook.mock.MockHook
    priority_ranges:
      - {range: [0, 5], pool_size: 5}
      - {range: [6, 10], pool_size: 2}
      - {range: [11, 15], pool_size: 1}
```

This configuration snippet describes how a how a topic is assigned
priority ranges for Kafka Consumers, as well the hook in which jobs in
this topic will be executed. ```pp-mock``` has three priority ranges,
and each is assigned a pool of workers - generally, the higher the
priority the more resources assigned. 

# PlayerPro API

## System Context

![API System Context]({{ "/assets/local/images/ppro_api_system_context.svg" | relative_url }})

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

![Cache Configuration]({{ "/assets/local/images/ppro_cache_logic_flow.svg" | relative_url }})

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

