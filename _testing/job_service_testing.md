---
title: "Testing and Debugging"
id: "testing-and-debugging" 
author: "DominicFollett"
---

# PlayerPro job Service

- [Testing](#testing)
  * [Running Tests](#running-tests)
    + [Run Unit Tests](#run-unit-tests)
    + [Run Integration Tests](#run-integration-tests)
    + [Run All Tests](#run-all-tests)
    + [Travis CI](#travis-ci)
    + [Deployment Considerations](#deployment-considerations)
      - [Ansible >= 2.1.1.0](#ansible----2110)
      - [Prepare servers](#prepare-servers)
      - [Install Kafka](#install-kafka)
      - [Deploy Job Service](#deploy-job-service)
    + [Kafka Developer Notes](#kafka-developer-notes)
      - [Using Kafka On Mac](#using-kafka-on-mac)
      - [Publish Dummy Events](#publish-dummy-events)
      - [Kafka Tools](#kafka-tools)
    + [Sanity Checks](#sanity-checks)
- [Debugging](#debugging)


# Testing

## Running Tests

### Run Unit Tests

```sh
$ python -m unittest discover tests
```

### Run Integration Tests

```sh
$ python -m unittest discover integration_tests
```

### Run All Tests

```sh
$ python -m unittest discover
```

**Remember to specify tests, specifically with python3.5 the imports
will work, but your mocks will fail.**

### Travis CI
Lorem Ipsum.

### Deployment Considerations

#### Ansible >= 2.1.1.0
Ensure your ansible is up to date, check version:

```sh
$ ansible-playbook --version
```

http://docs.ansible.com/ansible/intro_installation.html

```sh
$ sudo pip install ansible
```

#### Prepare servers
Configure network and provision servers in EC2, with basic configuration in place.

```sh
$ ansible-playbook -i aws_host/ec2.py prepare_servers.yml -e "@vars/span.yml" --private-key=aws-load_testing-private.pem
```

#### Install Kafka
Install Kafka on servers

```sh
$ ansible-playbook -i kafka-testing-inventory install_kafka.yml -e "@vars/span.yml" --private-key=aws-load_testing-private.pem --user=ubuntu
```

#### Deploy Job Service
Install Job Service on servers

### Kafka Developer Notes ###

#### Using Kafka On Mac ####

If you've used Brew to install kafka, you can easily start/stop kafka:

```sh
$ brew services restart kafka
```

You can edit kafka config here:

```sh
$ vi /usr/local/etc/kafka/server.properties
```

**Disclaimer:** brew doesn't always have the latest version of Kafka,
rather download the latest version and run as per:
http://kafka.apache.org/quickstart

#### Publish Dummy Events ####

```sh
$ ./produce_event.py --json sample/mock_event.json --loops 100
```

#### Kafka Tools ####
List consumer groups

```sh
$ bin/kafka-run-class.sh kafka.admin.ConsumerGroupCommand --bootstrap-server localhost:9092 --list
```

Get some basic info about a particular group:

```sh
$ bin/kafka-run-class.sh kafka.admin.ConsumerGroupCommand --bootstrap-server localhost:9092 --describe --group playerpro-event-consumer-group
```

and

```sh
$ bin/kafka-run-class.sh kafka.admin.ConsumerGroupCommand --bootstrap-server localhost:9092 --describe --group playerpro-job-consumer-group
```

### Sanity Checks ###
REPLACE WITH how to test that the product is correctly installed.

# Debugging
REPLACE WITH an explanation of how best to debug the solutions built using the product. 