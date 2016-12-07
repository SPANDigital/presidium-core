---
title: "Overview"
id: "overview" 
author: "dominicfollett"
---

# PlayerPro Overall System Architecture

![Overall Architecture](/assets/local/images/ppro_architecture_overview.svg)

# PlayerPro API

PlayerPro currently provides an API that offers many of the
functionality that one can perform on their website as well. Their
endpoints are partially grouped into themes. The response data from the
endpoints contains large amounts of irrelevant and confusion
information. Their conventions regarding request parameters, errors,
data formats etc are not always consistent. By and large the API is
difficult to use and does not provide a good end user experience.

## Interface Design

A clean and intuitive user experience requires considerable thought and
thus we use an design-first workflow in combination with suitable tool
support such as Swagger. We’ve chosen to use Swagger to design the API
interface. Swagger gives us a complete toolchain necessary to build and
manage a REST API. Furthermore, this gives us a clean framework in
which to:

* Design clean URLs
* Clearly define request parameters and response objects
* Manage headers
* Generate client side code in a number of languages
* Generate documentation


# PlayerPro Job Service

The PlayerPro Job Service, is a fully scalable service that allows
tightly coupled behaviours between the PHP Symfony App and the PlayerPro
API to be separated or abstracted out for handling via an asynchronous
mechanism - the result of which is improved throughput and scalability
across the PlayerPro Product.

The Job Service consists of an event bus (implemented as a Kafka queue, 
with a publish-subscribe pattern) that handles the transport of event
messages published by PHP Symfony and/or the PlayerPro API.
Additionally, a job queue handles the transport of enriched events 
(jobs) from the event consumer pipeline. Events are enriched or
'converted' into jobs through the application of configuration rules
supplied to the service. These jobs, in turn, are handled by a job
consumer pipeline where its termination culminates in changes to various
services and their resources, for example: webhooks, cache invalidation,
user feed generation and more.


## Supporting Scale

With PlayerPro's continued growth as a leader in football social media,
need has arisen to address the scalability concerns inherent large,
monolithic services.

### Through Decoupling:

The design of the PlayerPro Job Service supports iteratively decoupling
computationally expensive behaviours from the PlayerPro PHP Symfony and,
in stead, handling these in a distributed and highly scalable manner.


### Through Asychronicity:

Through the use of an asynchronous Job Service, actions that would
normally block - and, as a consequence ruin the quality of services, can
now be handled in a way that does not prevent the timely processing of
other (perhaps higher priority) work.

