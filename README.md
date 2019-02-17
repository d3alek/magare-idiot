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
npm run commit
```

## Deploy

Push to master automatically deploys to [Magare](github.com/d3alek/magare) via Travis CI.

Manually:

```
DEPLOY_USER=<deploy-user> DEPLOY_PASSWORD=<deploy-password> DEPLOY_URL=<deploy-url> ./deploy.sh
```
