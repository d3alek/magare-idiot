import Vue from "vue";
import PouchDB from "pouchdb";
//var PouchDB = require("pouchdb");
import find from "pouchdb-find";

PouchDB.plugin(find);
PouchDB.plugin(require("pouchdb-live-find"));
var db = PouchDB('idiot')

PouchDB.prototype.mine = 'true';

import PouchVue from "pouch-vue";

Vue.use(PouchVue, {
  pouch: PouchDB, // optional if `PouchDB` is available on the global object
  defaultDB: 'idiot', // this is used as a default connect/disconnect database
});
