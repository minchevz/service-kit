#!/bin/bash

cp ~/.npmrc .
cp ~/.gitconfig .
cp -R ~/.ssh/ .ssh/
docker build -t service-kit --rm -f config/Dockerfile .

## Clean up
rm .npmrc
rm .gitconfig
rm -rf .ssh
