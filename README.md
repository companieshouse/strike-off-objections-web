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
3. Run ./bin/chs-dev development enable strike-off-objections-web (this will allow you to make changes).
4. Once the service and Dev mode is enabled it is good to do a build (make clean build) on the service locally by getting into ./repositories/strike-off-objection-web
5. Run docker using "tilt up" in the docker-chs-development directory.
5. Use spacebar in the command line to open tilt window - wait for strike-off-objections-web to become green.
6. Open your browser and go to page http://chs.local/strike-off-objections

These instructions are for a local docker environment.

### Endpoints

Method | Path                                                                                                                     | Description
------ | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------
GET    | `/strike-off-objections`                                                                                                 | Returns the landing page for strike off objections
POST   | `/strike-off-objections`                                                                                                 | and redirect to objector organisation choice
GET    | `/strike-off-objections/objector-organisation`                                                                           | Returns the objector organisation choice
POST   | `/strike-off-objections/objector-organisation`                                                                           | Saves choice and redirects to objecting entity name
GET    | `/strike-off-objections/objecting-entity-name`                                                                           | Returns form to enter objecting entity name
POST   | `/strike-off-objections/objecting-entity-name`                                                                           | Saves name and redirects to company number
GET    | `/strike-off-objections/company-number`                                                                                  | Returns form to enter company number
POST   | `/strike-off-objections/company-number`                                                                                  | Saves company number and redirects to
GET    | `/strike-off-objections/confirm-company`                                                                                 |
POST   | `/strike-off-objections/confirm-company`                                                                                 |
GET    | `/strike-off-objections/notice-expired`                                                                                  | Returns the notice expired / too late to object page
GET    | `/strike-off-objections/no-strike-off`                                                                                   | Returns the no strike offnotice page
GET    | `/strike-off-objections/enter-information`                                                                               |
POST   | `/strike-off-objections/enter-information`                                                                               |
GET    | `/strike-off-objections/document-upload`                                                                                 |
POST   | `/strike-off-objections/document-upload`                                                                                 |
POST   | `/strike-off-objections/document-upload-continue`                                                                        |
GET    | `/strike-off-objections/remove-document`                                                                                 |
POST   | `/strike-off-objections/remove-document`                                                                                 |
GET    | `/strike-off-objections/company/:companyId/strike-off-objections/:requestId/attachments/:attachmentId/download`          |
GET    | `/strike-off-objections/download/company/:companyId/strike-off-objections/:requestId/attachments/:attachmentId/download` |
GET    | `/strike-off-objections/check-your-answers`                                                                              |
POST   | `/strike-off-objections/check-your-answers`                                                                              |
GET    | `/strike-off-objections/confirmation`                                                                                    |
GET    | `/strike-off-objections/error`                                                                                           | Returns the error page
GET    | `/strike-off-objections/change-answers`                                                                                  |
GET    | `/strike-off-objections/accessibility-statement`                                                                         | Returns the accessibility statement
GET    | `/strike-off-objections/objector-organisation`                                                                           |
POST   | `/strike-off-objections/objector-organisation`                                                                           |
GET    | `/strike-off-objections/signout`                                                                                         | Returns the signout options page
POST   | `/strike-off-objections/signout`                                                                                         | Sign user out or continue

### Config variables

Key                          | Example Value      | Description
---------------------------- | ------------------ | ----------------------------------------------
API_UR                       | http://<host:port> | Required for accessing the backend application
CACHE_SERVER                 | redis              | Required for storing values in memory
CDN_HOST                     | http://<cdn_host>  | Address of chs styling for the frontend
CHS_URL                      | http://chs.local   | Used when navigating to the webpage
COOKIE_DOMAIN                | chs.local          |
COOKIE_EXPIRATION_IN_SECONDS | 3600               |
COOKIE_NAME                  | SID                |
COOKIE_SECRET                | <signing_key>      |
COOKIE_SECURE_FLAG           | 0                  |
DOWNLOAD_FILENAME_PREFIX     | CH_SO_OBJ_         |
INTERNAL_API_URL             | http://<host:port> |
HUMAN_LOG                    | 1                  |
LOG_LEVEL                    | DEBUG              |
MAX_FILE_SIZE_BYTES          | 4194304            |
SHOW_SERVICE_OFFLINE_PAGE    | false              | Feature Flag

### Further Information
For further information on running building and testing ch node js apps see the [Node Web Starter](https://github.com/companieshouse/node-web-starter/blob/master/README.md) page.
