#!/bin/bash

# CHECK PREREQUISITES TO RUN JEKYLL

echo
echo Checking requirements to run Jekyll for Presidium...
echo

if  ! type "ruby" > /dev/null;
then
    echo
    echo '####################################'
    echo 'RUBY NOT FOUND'
    echo 'Please install ruby > 2.1 to continue...'
    echo '####################################'
    echo
    exit 1
elif ! type "bundle" > /dev/null;
then
    echo
    echo '####################################'
    echo 'BUNDLER NOT FOUND'
    echo 'Please install bundler to continue...'
    echo '`gem install bundler`'
    echo '####################################'
    echo
    exit 1
elif [[ $(ruby -v) < "ruby 2.1" ]]
then
    echo
    echo '####################################'
    echo 'UNSUPPORTED VERSION OF RUBY'
    echo 'Require ruby version >= 2.1'
    echo 'Found: ' $(ruby -v)
    echo 'Please upgrade your ruby to continue'
    echo '####################################'
    echo
    exit 1
else
  echo 'Using:'
  echo $(ruby -v)
  echo $(bundle -v)
  echo
fi