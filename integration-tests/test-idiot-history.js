const expect = require('chai').expect;
const util = require('./util.js');

const ddName = "idiot-history";
const viewName = "idiot-history";

const throwMessage = util.throwMessage;

var db;
var adminDb;

const timestamp = new Date('2019-02-09T18:08:11.706Z');
const thing = 'test-doc';

function doc(thing, timestamp, sense1, sense2) {
  return {
    _id: thing + '$' + timestamp, 
    thing: thing,
    senses: {
      ...sense1,
      ...sense2,
    },
    timestamp: timestamp
  }
}

describe(ddName, () => {
  before( async () => {
    const server = process.env.TEST_COUCHDB_ADDR;
    const url = util.getUrl(server, ddName);
    db = new util.AnonymousDB(url);
    adminDb = new util.AdminDB(url);
    await adminDb.destroy();

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
      await db.remove(id, docs.rows[row].value.rev).catch(throwMessage);
    }
  })

  it('design doc exists', async () => {
    const result = await db.allDocs();
    expect(result.rows).to.have.length(1);
    expect(result.rows[0].id).to.equal('_design/' + ddName);
  });

  it('simple', async () => {
    await db.put(doc(thing, timestamp, {a:1}));
    const response = await db.query(ddName + '/' + viewName).catch(throwMessage);
    expect(response.total_rows).to.equal(1);
    expect(response.rows[0].key).to.deep.equal([thing, 2019, 1, 9, 18, 8, 11]); // note how month starts from 0 not 1 so 2nd month is 1
    expect(response.rows[0].value).to.deep.equal({senses: {a:1}});
  });

  it('multiple senses', async () => {
    await db.put(doc(thing, timestamp, {a:1}, {b:2}));
    const response = await db.query(ddName + '/' + viewName).catch(throwMessage);
    expect(response.total_rows).to.equal(1);
    expect(response.rows[0].value).to.deep.equal({senses: {a:1, b:2}});
  });

  it('multiple docs', async () => {
    const timestamp_old = new Date('2018-11-28T07:44:18Z');
    const timestamp_new = new Date('2018-11-28T08:44:18Z');

    await db.put(doc(thing, timestamp_old, {a:1}));
    await db.put(doc(thing, timestamp_new, {a:2}));
    const response = await db.query(ddName + '/' + viewName).catch(throwMessage);
    expect(response.total_rows).to.equal(2);
    expect(response.rows[0].value).to.deep.equal({senses:{a:1}});
    expect(response.rows[1].value).to.deep.equal({senses:{a:2}});
  });

  it('multiple things', async () => {
    const thing1 = 'thing1';
    const thing2 = 'thing2';

    await db.put(doc(thing1, timestamp, {a:1}));
    await db.put(doc(thing2, timestamp, {a:2}));
    const response = await db.query(ddName + '/' + viewName).catch(throwMessage);
    expect(response.total_rows).to.equal(2);
    expect(response.rows[0].value.senses).to.deep.equal({a:1});
    expect(response.rows[1].value.senses).to.deep.equal({a:2});
  });

  it('filter by day', async () => {
    const time = 'T07:44:18Z';
    const timestamp_date = '2018-11-28';
    const timestamp = new Date(timestamp_date + time);
    const another_timestamp_date = '2018-11-29';
    const another_timestamp = new Date(another_timestamp_date + time);

    await db.put(doc(thing, timestamp, {a:1}));
    await db.put(doc(thing, another_timestamp, {a:2}));
    const response = await db.query(ddName + '/' + viewName, options={startkey:[thing, 2018,10,28], endkey: [thing, 2018,10,29]}).catch(throwMessage);
    expect(response.rows.length).to.equal(1);
    expect(response.rows[0].value.senses).to.deep.equal({a:1});
  });

});

