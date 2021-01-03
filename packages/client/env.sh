#!/bin/bash

rm -rf ./env-config.js
touch ./env-config.js

echo "window._env_ = {" >> ./env-config.js
echo "\"SERVER_URI\":\"${SERVER_URI}\"" >> ./env-config.js
echo "}" >> ./env-config.js