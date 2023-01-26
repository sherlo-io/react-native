#!/bin/bash

ENV_PATH=./.env 
if test -f "$ENV_PATH"; then
  source $ENV_PATH
fi

var=$1

if [ -z ${var} ]; then
  REF=$CLIENT_STAGE
else
  REF=$var
fi

rm -rf ./sherlo-lib
mkdir ./sherlo-lib

curl \
  -o ./sherlo-lib/sherlo-api-client.tgz \
  -L https://sherlo-packages.s3.eu-central-1.amazonaws.com/$REF/sherlo-api-client.tgz \
  --silent

curl \
  -o ./sherlo-lib/sherlo-api-types.tgz \
  -L https://sherlo-packages.s3.eu-central-1.amazonaws.com/$REF/sherlo-api-types.tgz \
  --silent