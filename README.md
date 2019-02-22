[![Build Status](https://travis-ci.com/d3alek/magare-idiot.svg?branch=master)](https://travis-ci.com/d3alek/magare-idiot)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Run locally

```
cd idiot-view
yarn serve
```

## Run tests

Requirements:
- a running local CouchDB. If you have Docker, it is easiest to use the [Docker CouchDB images](https://hub.docker.com/_/couchdb/)
- test configuration on the CouchDB. See the [Travis CI configuration](.travis.yml) for the commands to configure a vanilla CouchDB 

Then:

```
TEST_COUCHDB_ADDR=localhost:5984 npm test
```

## Commit

Rely on [commitizen](https://github.com/commitizen/cz-cli) to enforce the [Conventional Commits](https://www.conventionalcommits.org) standard on commit messages.

```
git add .
npm run commit
```

## Deploy

Push to master automatically deploys to [Magare](github.com/d3alek/magare) via Travis CI.

Manually:

```
DEPLOY_USER=<deploy-user> DEPLOY_PASSWORD=<deploy-password> DEPLOY_HOST=<deploy-host> ./deploy.sh
```
The default schema is "https" so when deploying locally include `SCHEMA` variable, as well as specifying the port in `DEPLOY_HOST`:

```
DEPLOY_USER=test-admin DEPLOY_PASSWORD=test-admin-password DEPLOY_HOST=localhost:5984 SCHEMA=http ./deploy.sh
```

## Arduino code

Arduino code tested with ESP8266 (ESP12e and [Olimex MOD-WIFI](https://www.olimex.com/Products/IoT/ESP8266/MOD-WIFI-ESP8266-DEV/open-source-hardware)) is in separate repository [esp-idiot](https://github.com/d3alek/esp-idiot)
