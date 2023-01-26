#!/bin/bash

VERSION=$1

yarn update-libs prod

mkdir ./sherlo-lib/sherlo-api-client
tar -xvzf ./sherlo-lib/sherlo-api-client.tgz -C ./sherlo-lib/sherlo-api-client
yarn publish --no-git-tag-version --new-version $VERSION --cwd ./sherlo-lib/sherlo-api-client/package

mkdir ./sherlo-lib/sherlo-api-types
tar -xvzf ./sherlo-lib/sherlo-api-types.tgz -C ./sherlo-lib/sherlo-api-types
yarn publish --no-git-tag-version --new-version $VERSION --cwd ./sherlo-lib/sherlo-api-types/package

tmp=$(mktemp)
jq --arg version "$VERSION" '.dependencies."@sherlo/api-client" = $version | .dependencies."@sherlo/api-types" = $version' package.json > "$tmp" && mv "$tmp" package.json

yarn build
yarn publish --no-git-tag-version --new-version $VERSION 
jq '.dependencies."@sherlo/api-client" = "./sherlo-lib/sherlo-api-client.tgz" | .dependencies."@sherlo/api-types" = "./sherlo-lib/sherlo-api-types.tgz"' package.json > "$tmp" && mv "$tmp" package.json
