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

exports.getServer = async () => await execPromise('integration-tests/init-test-couchdb.sh');

exports.putValidation = async (server, validation) => {
  const command = 'npm run push http://test-admin:test-admin-password@'+server+validation + ' couchdb/idiot/_design/'+validation;
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

