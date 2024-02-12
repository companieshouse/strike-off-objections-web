#!/bin/bash
#
# Start script for applications.developer.ch.gov.uk
PORT=3000

export NODE_PORT=${PORT}
exec node /opt/bin/www.js -- ${PORT}