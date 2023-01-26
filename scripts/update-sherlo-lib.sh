#!/bin/bash

var=$1

if [ -z ${var} ]; then
  ./scripts/download-sherlo-lib.sh
else
  ./scripts/download-sherlo-lib.sh $1
fi

yarn remove -W @sherlo/api-types @sherlo/api-client

yarn cache clean

yarn add -W --update-checksums --ignore-scripts \
  @sherlo/api-types@./sherlo-lib/sherlo-api-types.tgz \
  @sherlo/api-client@./sherlo-lib/sherlo-api-client.tgz 

cd Example 

yarn remove -W @sherlo/react-native

yarn add -W --update-checksums --ignore-scripts \
  @sherlo/react-native@link:../.