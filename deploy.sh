#!/bin/bash

echo "Fetching updates from github ..."
git restore . && git pull

echo "Stopping current pm2 process ..."
pm2 stop all && pm2 delete all

echo "Installing dependencies ..."
npm install \
    && echo "Starting new pm2 process ..." \
    && pm2 start start.json

