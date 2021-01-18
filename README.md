# Strike Off Objections Web

### Overview

Web frontend for submitting objections to a company being struck off the register.

### Requirements

In order to run the service locally you will need the following:

- [NodeJS](https://nodejs.org/en/)
- [Git](https://git-scm.com/downloads)

### Getting started

To checkout and build the service:
1. Clone [Docker CHS Development](https://github.com/companieshouse/docker-chs-development) and follow the steps in the README. 
2. Run ./bin/chs-dev modules enable strike-off-objections
3. Run ./bin/chs-dev development enable strike-off-objections (this will allow you to make changes).
4. Run docker using "tilt up" in the docker-chs-development directory.
5. Use spacebar in the command line to open tilt window - wait for strike-off-objections-web to become green.
6. Open your browser and go to page http://chs.local/strike-off-objections

These instructions are for a local docker environment.

### Config variables


Key             | Example Value   | Description
----------------|---------------- |------------------------------------
API_UR       | http://<host:port> | Required for accessing the backend application
CACHE_SERVER | redis | Required for storing values in memory
CDN_HOST     | http://<cdn_host> | Address of chs styling for the frontend
CHS_URL | http://chs.local | Used when navigating to the webpage
COOKIE_DOMAIN | chs.local | 
COOKIE_EXPIRATION_IN_SECONDS | 3600 | 
COOKIE_NAME | SID |
COOKIE_SECRET | <signing_key> |
COOKIE_SECURE_FLAG | 0 |
DOWNLOAD_FILENAME_PREFIX | CH_SO_OBJ_ |
INTERNAL_API_URL | http://<host:port> |
HUMAN_LOG | 1 |
LOG_LEVEL | DEBUG |
MAX_FILE_SIZE_BYTES | 4194304 |
SHOW_SERVICE_OFFLINE_PAGE | false | Feature Flag

### Further Information
For further information on running building and testing ch node js apps see the [Node Web Starter](https://github.com/companieshouse/node-web-starter/blob/master/README.md) page
