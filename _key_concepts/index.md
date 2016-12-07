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

### Job Expiration

There

# PlayerPro API