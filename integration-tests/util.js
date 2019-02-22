const PouchDB = require('pouchdb');
const { exec } = require('child_process');

function execPromise(command) {
    return new Promise(function(resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(stdout.trim());
        });
    });
}

const getUrl = (server, ddName, authenticated) => {
  return 'http://' + (authenticated ? 'test-admin:test-admin-password@': '') + server + '/test-' + ddName;
}

exports.getServer = async () => await execPromise('integration-tests/init-test-couchdb.sh');

exports.putValidation = async (server, validation, db) => {
  if (!db) {
    db = 'idiot'
  }
  const command = 'npm run push ' + getUrl(server, validation, true) + ` couchdb/${db}/_design/`+validation;
  await execPromise(command);
};

exports.AnonymousDB = PouchDB.defaults({skip_setup: true});

exports.AuthenticatedDB = PouchDB.defaults({
  skip_setup: true,
  auth: {
    username: "test-user",
    password: "test-user-password"
  }
});

exports.AdminDB = PouchDB.defaults({
  auth: {
    username: "test-admin",
    password: "test-admin-password"
  }
});

exports.throwMessage = (err) => {
  throw Error('ERROR: ' + err.message);
};

exports.logMessage = (err) => {
  console.log('ERROR: ' + err.message);
};

exports.key = (thing, timestamp) => {
  return thing + '$' + timestamp;
}

exports.getUrl = getUrl
