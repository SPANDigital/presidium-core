---
title: "Getting Started"
id: "getting-started" 
author: "dominicfollett"
---

# Before You Code

Before you code, read the following documentation. It is the most essential information you need before you start.

* **[Overview:](../overview)** "REPLACE WITH your product name" business-level description of main benefits versus alternative solutions
* **[Key Concepts:](../key-concepts)** Conceptual description and diagram of how "REPLACE WITH your product name" works
* **[Tools:](../tools)** List of supporting tools and services that can be used with "REPLACE WITH your product name" 
* **[Getting Started:](../getting-started)** How to start using "REPLACE WITH your product name" (this section)
* **[Best Practices:](../best-practices)** How you should use "REPLACE WITH your product name" for best results

# What You Will Need When You Code

Refer to the following documentation as you work. 

* **[Typical Usage Scenarios:](../typical-scenarios)** How components work together to enable commonly implemented scenarios
* **[References:](../references)** Detailed code usage descriptions with code snippets
* **[Cookbook:](../cookbook)** 'Recipes' That solve a specific problem or achieve a specific solution
* **[Testing & Debugging:](../testing)** — Strategic overview description of how to test and debug "REPLACE WITH your product name"
* **[Updates:](../updates)** Release and patch announcements as well as articles of interest to "REPLACE WITH your product name" users
* **[Contribution:](../contribution)** How to provide feedback, report issues, contribute to development, or contact us

# Downloading the Code

The Job Service and PlayerPro API are available
[here](https://github.com/SPANDigital/playerpro-job-service/) and
[here](https://github.com/SPANDigital/playerpro-api-v2) respectively.

### Installation

1. [PlayerPro Job Service](#job-service)
2. [PlayerPro API](#playerpro-api)

# Setup and Configuration

## Job Service ##

### Create virtualenv, activate it, and install dependencies. ###

#### Python 3.5.2 ####

Some python 3.5 specific code is used. For example:

    # This code is 3.5 specific, and won't work on <= 3.4
    a = {}
    b = {}
    c = {**a, **b}
    

##### Mac #####
    brew install python3
    brew install snappy
    pip install virtualenv
        
##### Ubuntu #####
    sudo apt-get install python-pip python3-dev snappy libsnappy-dev
    sudo pip install virtualenv
    
###### Ubuntu 14.04 ######
Ubuntu 14.04 installs python3.4 if you're using the normal repo's. You may use 
fkrull to get 3.5.2

    sudo add-apt-repository ppa:fkrull/deadsnakes
    sudo apt-get update
    sudo apt-get install python3.5 python3.5-dev
    
##### Virtualenv #####
    virtualenv -p python3 .
    . bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt --upgrade
    
    
Be aware snappy may fail to install, if this is the case, see troubleshooting below.

###### Troubleshooting #####
- Error installing python-snappy on Mac?

        snappymodule.cc:31:10: fatal error: 'snappy-c.h' file not found
        #include <snappy-c.h>
                 ^
        1 error generated.
        error: command 'clang' failed with exit status 1
        
    - Install python snappy
    
            brew install snappy
            CPPFLAGS="-I/usr/local/include -L/usr/local/lib" pip install python-snappy
            
- Error installing python-snappy on Ubuntu?
         
        x86_64-linux-gnu-gcc -pthread -DNDEBUG -g -fwrapv -O2 -Wall -Wstrict-prototypes -g -fstack-protector --param=ssp-buffer-size=4 -Wformat -Werror=format-security -D_FORTIFY_SOURCE=2 -fPIC -I/usr/include/python3.4m -I/home/sybrandspan/Workspace/playerpro-job-service/include/python3.4m -c snappymodule.cc -o build/temp.linux-x86_64-3.4/snappymodule.o
        cc1plus: warning: command line option ‘-Wstrict-prototypes’ is valid for C/ObjC but not for C++ [enabled by default]
        snappymodule.cc:28:20: fatal error: Python.h: No such file or directory
         #include "Python.h"
                            ^
        compilation terminated.
        error: command 'x86_64-linux-gnu-gcc' failed with exit status 1
        
    - Install python snappy
    
            ./bin/easy_install snappy


### Run the Job Scheduler ###

    python run_job_scheduler.py

or

    ./run_job_scheduler.py
    
### Run the Overlord ###

    ./run_overlord.py
    
### Run unit tests ###

    python -m unittest discover tests
    
### Run integration tests ###

    python -m unittest discover integration_tests

### Run all tests ###

    python -m unittest discover
    
**Remember to specify tests, specifically with python3.5 the imports will work, but your mocks will fail.**

### Install Kafka on AWS ###

#### Ansible >= 2.1.1.0

Ensure your ansible is up to date

Check version: ansible-playbook --version

http://docs.ansible.com/ansible/intro_installation.html

    sudo pip install ansible

#### Prepare servers ####

Configure network and provision servers in EC2, with basic configuration in place.

    ansible-playbook -i aws_host/ec2.py prepare_servers.yml -e "@vars/span.yml" --private-key=aws-load_testing-private.pem
    
    
#### Install Kafka ####

Install Kafka on servers

    ansible-playbook -i kafka-testing-inventory install_kafka.yml -e "@vars/span.yml" --private-key=aws-load_testing-private.pem --user=ubuntu


#### Deploy Job Service ####

Install Job Service on servers



#### Using Kafka On Mac ####

If you've used Brew to install kafka, you can easily start/stop kafka:

    brew services restart kafka

You can edit kafka config here:

    vi /usr/local/etc/kafka/server.properties
    
    
**Disclaimer:** brew doesn't always have the latest version of Kafka, rather download the latest version and run as per: http://kafka.apache.org/quickstart


### Dev notes relating to Kafka

#### Produce events to play with ####

    ./produce_event.py --json sample/mock_event.json --loops 100

#### The Kafka Tools ####

List consumer groups

    bin/kafka-run-class.sh kafka.admin.ConsumerGroupCommand --bootstrap-server localhost:9092 --list
    
Get some basic info about a particular group

    bin/kafka-run-class.sh kafka.admin.ConsumerGroupCommand --bootstrap-server localhost:9092 --describe --group playerpro-event-consumer-group
    
and

    bin/kafka-run-class.sh kafka.admin.ConsumerGroupCommand --bootstrap-server localhost:9092 --describe --group playerpro-job-consumer-group

### Confirming it Works ###

REPLACE WITH how to test that the product is correctly installed.

## PlayerPro API ##

### Create virtualenv, activate it, and install dependencies. ###

#### Python 2.7.9 ####

##### Mac #####
    brew install python
    pip install virtualenv

##### Ubuntu #####
    sudo apt-get install python-pip
    sudo pip install virtualenv

##### Virtualenv #####
    virtualenv .
    . bin/activate
    pip install -r requirements.txt
    
or if you're doing something very fancy

    virtualenv -p /usr/local/bin/python2.7.
    . bin/activate
    pip install -r requirements.txt

#### PyPy ####
    brew install pypy
    virtualenv -p /usr/local/bin/pypy pypy
    . pypy/bin/activate
    pip install -r requirements.txt

### Install autoenv ####
See https://github.com/kennethreitz/autoenv for details.

    cp .env_cpython .env

#### On Mac ####
    brew install autoenv

then depending on where activate.sh is:

    echo 'source /usr/local/opt/autoenv/activate.sh' >> ~/.bash_profile

or

    echo 'source /usr/local/opt/autoenv/activate.sh' >> ~/.profile
    
#### On Ubuntu ####
    pip install autoenv

then - depending on where activate.sh is:

    echo 'source ~/.local/bin/activate.sh' >> ~/.bashrc
or
    echo 'source /usr/local/bin/activate.sh' >> ~/.bashrc
    
#### pypy ####
    cp .env_pypy .env
    
    source $(dirname "${BASH_SOURCE[0]}")/pypy/bin/activate

### Configure and start ###

Make a copy of settings.local.sample.cfg, and modify it as needed

    cp etc/settings.sample.cfg etc/settings.cfg
    vi settings.local.cfg

### Deactivate, and let autoenv take over ###

    deactivate
    cd <player pro location>

### Run the api ###

    python run_api.py

### Running tests ###

    python tests/run_tests.py

OR

    python -m unittest discover


### Swagger ###

See: http://swagger.io/swagger-editor/

    git clone https://github.com/swagger-api/swagger-editor.git
    cd swagger-editor
    npm start
    
Validating swagger:

    npm install -g swagger-cli
    swagger validate playerpro.yaml

## Generating Android and iOS clients ##

Using Swagger Code Generator (see: https://github.com/swagger-api/swagger-codegen)

The project is included as a git submodule, in ./modules/swagger-codegen

### Submodule issues ###
Submodules can be a bit troublesome when switching between branches that have and don't have submodules.
To get things working again - try:
    git fetch
    git checkout master # or any other branch that you need the latest of
    git merge origin/master

or:
git submodule update --init --recursive

### Installing ###

*Swagger Code Generator specifies that it needs Java 1.7: http://www.oracle.com/technetwork/java/javase/downloads/java-archive-downloads-javase7-521261.html, but it seems to work
just fine with 1.8*

    brew install maven
    cd ./modules/swagger-codegen
    mvn package

### Android ###

Run ./scripts/android-java-playerpro.sh

Will generate code in: dist/client/playerpro/android-java

### Objective C ###

Run ./scripts/objc-playerpro.sh

Will generate code in: dist/client/playerpro/objc

### Static HTML ###

Run ./scripts/html-playerpro.sh