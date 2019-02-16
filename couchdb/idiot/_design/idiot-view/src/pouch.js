import Vue from "vue";
import PouchDB from "pouchdb";
//var PouchDB = require("pouchdb");
import find from "pouchdb-find";

PouchDB.debug.enable('pouchdb-find');

PouchDB.plugin(find);
PouchDB.plugin(require("pouchdb-live-find"));

import PouchVue from "pouch-vue";

Vue.use(PouchVue, {
  pouch: PouchDB, // optional if `PouchDB` is available on the global object
});
