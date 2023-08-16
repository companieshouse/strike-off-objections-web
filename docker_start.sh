#!/bin/bash
#
# Start script for applications.developer.ch.gov.uk
npm i
PORT=3000

export NODE_PORT=${PORT}
exec node /opt/bin/www.js -- ${PORT}