---
title: "Getting Started"
id: "getting-started" 
author: "dominicfollett"
---

# Before You Code

Before you code, read the following documentation. It is the most essential information you need before you start.

* **[Overview:](../overview)** "REPLACE WITH your product name" business-level description of main benefits versus alternative solutions
* **[Key Concepts:](../key-concepts)** Conceptual description and diagram of how "REPLACE WITH your product name" works

# What You Will Need When You Code

Refer to the following documentation as you work. 

* **[Testing & Debugging:](../testing)** — Strategic overview description of how to test and debug "REPLACE WITH your product name"

# Downloading the Code

The Job Service and PlayerPro API are available
[here](https://github.com/SPANDigital/playerpro-job-service/) and
[here](https://github.com/SPANDigital/playerpro-api-v2) respectively.

# Installation, Setup and Configuration

- [Job Service](#job-service)
  * [Create virtualenv, activate it, and install dependencies.](#create-virtualenv--activate-it--and-install-dependencies)
    + [Python 3.5.2](#python-352)
      - [Mac](#mac)
      - [Ubuntu](#ubuntu)
        * [Ubuntu 14.04](#ubuntu-1404)
      - [Virtualenv](#virtualenv)
      - [Troubleshooting](#troubleshooting)
- [Running the Job Service](#running-the-job-service)
  * [Run the Job Scheduler](#run-the-job-scheduler)
  * [Run the Overlord](#run-the-overlord)
- [PlayerPro API](#playerpro-api)
  * [Create virtualenv, activate it, and install dependencies.](#create-virtualenv--activate-it--and-install-dependencies-1)
    + [Python 2.7.9](#python-279)
      - [Mac](#mac-1)
      - [Ubuntu](#ubuntu-1)
      - [Virtualenv](#virtualenv-1)
    + [PyPy](#pypy)
  * [Install autoenv](#install-autoenv)
    + [On Mac](#on-mac)
    + [On Ubuntu](#on-ubuntu)
    + [pypy](#pypy)
  * [Configure and start](#configure-and-start)
  * [Deactivate, and let autoenv take over](#deactivate--and-let-autoenv-take-over)
  * [Run the api](#run-the-api)
  * [Running tests](#running-tests)
  * [Swagger](#swagger)
- [Generating Android and iOS clients](#generating-android--ios-clients)
  * [Submodule issues](#submodule-issues)
  * [Installing](#installing)
  * [Android](#android)
  * [Objective C](#objective-c)
  * [Static HTML](#static-html)

# Job Service

## Set Up Virtualenv & Install Dependencies

### Python 3.5.2
Some python 3.5 specific code is used. For example:

```python
# This code is 3.5 specific, and won't work on <= 3.4
a = {}
b = {}
c = {**a, **b}
```

#### Mac

```sh
$ brew install python3
$ brew install snappy
$ pip install virtualenv
```

#### Ubuntu

```sh
$ sudo apt-get install python-pip python3-dev snappy libsnappy-dev
$ sudo pip install virtualenv
```    

##### Ubuntu 14.04
Ubuntu 14.04 installs ```python-3.4``` if you're using the normal
repo's. You may use ```fkrull``` to get ```python-3.5.2```

```sh
$ sudo add-apt-repository ppa:fkrull/deadsnakes
$ sudo apt-get update
$ sudo apt-get install python3.5 python3.5-dev
```

#### Virtualenv

```sh
$ virtualenv -p python3 .
$ . bin/activate
$ pip install --upgrade pip
$ pip install -r requirements.txt --upgrade
```

#### Troubleshooting
Be aware snappy may fail to install, if this is the case, see
troubleshooting below. Error installing python-snappy on Mac?

```sh
snappymodule.cc:31:10: fatal error: 'snappy-c.h' file not found
#include <snappy-c.h>
     ^
1 error generated.
error: command 'clang' failed with exit status 1
```

Install python snappy:

```sh
$ brew install snappy
$ CPPFLAGS="-I/usr/local/include -L/usr/local/lib" pip install python-snappy
```

Error installing python-snappy on Ubuntu?

```sh
x86_64-linux-gnu-gcc -pthread -DNDEBUG -g -fwrapv -O2 -Wall -Wstrict-prototypes -g -fstack-protector --param=ssp-buffer-size=4 -Wformat -Werror=format-security -D_FORTIFY_SOURCE=2 -fPIC -I/usr/include/python3.4m -I/home/sybrandspan/Workspace/playerpro-job-service/include/python3.4m -c snappymodule.cc -o build/temp.linux-x86_64-3.4/snappymodule.o
cc1plus: warning: command line option ‘-Wstrict-prototypes’ is valid for C/ObjC but not for C++ [enabled by default]
snappymodule.cc:28:20: fatal error: Python.h: No such file or directory
 #include "Python.h"
                    ^
compilation terminated.
error: command 'x86_64-linux-gnu-gcc' failed with exit status 1
```

Install python snappy:

```sh
$ ./bin/easy_install snappy
```

## Running The Job Service

### Run The Job Scheduler

```sh
$ python run_job_scheduler.py
```

or

```sh
$ ./run_job_scheduler.py
```

### Run The Overlord

```sh
$ ./run_overlord.py
```

# PlayerPro API

## Set Up Virtualenv & Install Dependencies

### Python 2.7.9

#### Mac

```sh
$ brew install python
$ pip install virtualenv
```

#### Ubuntu

```sh
$ sudo apt-get install python-pip
$ sudo pip install virtualenv
```

#### Virtualenv

```sh
$ virtualenv .
$ . bin/activate
$ pip install -r requirements.txt
```

or if you're doing something very fancy

```sh
$ virtualenv -p /usr/local/bin/python2.7.
$ . bin/activate
$ pip install -r requirements.txt
```

### PyPy

```sh
$ brew install pypy
$ virtualenv -p /usr/local/bin/pypy pypy
$ . pypy/bin/activate
$ pip install -r requirements.txt
```

### Install ```autoenv```
See https://github.com/kennethreitz/autoenv for details.

```sh
$ cp .env_cpython .env
```

#### On Mac

```sh
$ brew install autoenv
```

then depending on where activate.sh is:

```sh
$ echo 'source /usr/local/opt/autoenv/activate.sh' >> ~/.bash_profile
```

or

```sh
$ echo 'source /usr/local/opt/autoenv/activate.sh' >> ~/.profile
```

#### On Ubuntu

```sh
$ pip install autoenv
```

then - depending on where activate.sh is:

```sh
$ echo 'source ~/.local/bin/activate.sh' >> ~/.bashrc
```

or

```sh
$ echo 'source /usr/local/bin/activate.sh' >> ~/.bashrc
```

#### PyPy

```sh
$ cp .env_pypy .env
$ source $(dirname "${BASH_SOURCE[0]}")/pypy/bin/activate
```

### Configure & Start

Make a copy of settings.local.sample.cfg, and modify it as needed

```sh
$ cp etc/settings.sample.cfg etc/settings.cfg
$ vi settings.local.cfg
```

### Deactivate & Let ```autoenv``` Take Over

```sh
$ deactivate
$ cd <player pro location>
```

### Run The API

```sh
$ python run_api.py
```

### [Swagger](http://swagger.io/swagger-editor/)

```sh
$ git clone https://github.com/swagger-api/swagger-editor.git
$ cd swagger-editor
$ npm start
```

Validating Swagger:

```sh
$ npm install -g swagger-cli
$ swagger validate playerpro.yaml
```

## Generating Android & iOS Clients
Using the [Swagger Code Generator](https://github.com/swagger-api/swagger-codegen):
the project is included as a git submodule, in ```./modules/swagger-codegen```

### Submodule Issues
Submodules can be a bit troublesome when switching between branches
that have and don't have submodules. To get things working again - try:

```sh
$ git fetch
$ git checkout master # or any other branch that you need the latest of
$ git merge origin/master
```

or:

```sh
$ git submodule update --init --recursive
```

### Installing
*Swagger Code Generator specifies that it needs [Java 1.7](http://www.oracle.com/technetwork/java/javase/downloads/java-archive-downloads-javase7-521261.html)
but it seems to work just fine with 1.8*

```sh
$ brew install maven
$ cd ./modules/swagger-codegen
$ mvn package
```

### Android

```sh
$ ./scripts/android-java-playerpro.sh
```

Will generate code in: ```dist/client/playerpro/android-java```

### Objective C

```sh
$ ./scripts/objc-playerpro.sh
```

Will generate code in: ```dist/client/playerpro/objc```

### Static HTML

```sh
$ ./scripts/html-playerpro.sh
```