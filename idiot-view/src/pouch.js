import Vue from "vue";
import PouchDB from "pouchdb";
import find from "pouchdb-find";
import debug from "pouchdb-debug";
import allDbs from "pouchdb-all-dbs";

PouchDB.plugin(find);
PouchDB.plugin(debug);
PouchDB.plugin(allDbs);
PouchDB.plugin(require("pouchdb-live-find"));

import PouchVue from "pouch-vue";

Vue.use(PouchVue, {
  pouch: PouchDB,
  debug: 'pouchdb:find'
});
