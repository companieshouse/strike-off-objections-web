# Strike Off Objections Web

### Overview

Web frontend for submitting objections to a company being struck off the register.

### Requirements

In order to run the service locally you will need the following:

- [NodeJS](https://nodejs.org/en/)
- [Node Version Manager](https://github.com/nvm-sh/nvm)
- [Homebrew](https://formulae.brew.sh/formula/node)
- [expressJS](https://expressjs.com/)
- [NunJucks](https://mozilla.github.io/nunjucks)
- [Git](https://git-scm.com/downloads)

### Getting started

To checkout and build the service:
1. Clone [Docker CHS Development](https://github.com/companieshouse/docker-chs-development) and follow the steps in the README. 
2. git clone strike off objections web under your "repositories/SingleService" directory you will also require [Strike Off Objections API](https://github.com/companieshouse/strike-off-objections-api)
3. run make
4. Enable modules strike-off-objections.
5. Enable development strike-off-objections api and web this will allow you to make changes.
6. Run docker using "tilt up" in the docker chs root directory.

These instructions are for a local docker environment.

### Further Information
For futher informaion on running building and testing ch node js apps see the [Node Web Starter](https://github.com/companieshouse/node-web-starter/blob/master/README.md) page




