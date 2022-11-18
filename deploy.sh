#!/bin/bash

echo "Fetching updates from github ..."
git restore . && git pull

echo "Stopping current pm2 process ..."
pm2 stop "DirtBot" && pm2 stop "DirtBot - Frontend" && pm2 delete "DirtBot" && pm2 delete "DirtBot - Frontend"

echo "Installing dependencies ..."
npm install \
    && echo "Starting new pm2 process ..." \
    && pm2 start start.json

