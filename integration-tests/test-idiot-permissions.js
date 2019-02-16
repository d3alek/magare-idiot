const expect = require('chai').expect;
const util = require('./util.js');

const ddName = "idiot-permissions";

const throwMessage = util.throwMessage;
const logMessage = util.logMessage;

var anonymousDb;
var db;
var adminDb;
var usersDb;

function doc() {
  return {_id: 'test-doc'};
}

async function givenRole(...roleNames) {
  const user = await usersDb.get('org.couchdb.user:test-user').catch(throwMessage)
  if (roleNames) {
    user.roles = roleNames;
  }
  else {
    user.roles = [];
  }
  await usersDb.put(user).catch(throwMessage)
}

describe(ddName, () => {
  before( async () => {
    const server = process.env.TEST_COUCHDB_ADDR;
    const url = 'http://' + server + '/' + ddName;
    anonymousDb = new util.AnonymousDB(url);
    db = new util.AuthenticatedDB(url);
    adminDb = new util.AdminDB(url);

    const usersUrl = 'http://' + server + '/_users';
    usersDb = new util.AdminDB(usersUrl);

    await util.putValidation(server, ddName);
  });

  beforeEach( async () => {
    const docs = await db.allDocs();
    var id;
    for (row in docs.rows) {
      id = docs.rows[row].id; 
      if (id.startsWith('_design')) {
        continue;
      }
      d = {}
      d._id = id;
      d._rev = docs.rows[row].value.rev;
      d.author = 'test-admin';
      d._deleted = true;
      await adminDb.put(d);
    }
    await givenRole().catch(throwMessage);
  })

  it('design doc exists', async () => {
    const result = await db.allDocs();
    expect(result.rows).to.have.length(1);
    expect(result.rows[0].id).to.equal('_design/' + ddName);
  });

  it('anonymous not allowed to create', async () => {
    const response = await anonymousDb.put(doc()).catch(logMessage);
    expect(response).to.be.undefined;
  });

  it('authenticated not idiot not allowed to edit', async () => {
    const response = await db.put(doc()).catch(logMessage);
    expect(response).to.be.undefined;
  });

  it('authenticated idiot not allowed to create', async () => {
    await givenRole('idiot');
    const response = await db.put(doc()).catch(logMessage);
    expect(response).to.be.undefined;
  });

  it('authenticated idiot allowed to edit', async () => {
    await givenRole('idiot');

    const d = doc()
    d.author = 'test-admin'
    const putResult = await adminDb.put(d)

    d._rev = putResult.rev;
    d.author = 'test-user'

    const response = await db.put(d).catch(throwMessage);
    expect(response.ok).to.be.true;
  });

  it('authenticated idiot robot allowed to create', async () => {
    await givenRole('idiot', 'robot');
    const response = await db.put(doc()).catch(throwMessage);
    expect(response.ok).to.be.true;
  });
});

