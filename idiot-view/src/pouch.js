import Vue from "vue";
import PouchDB from "pouchdb";
import find from "pouchdb-find";

PouchDB.plugin(find);
PouchDB.plugin(require("pouchdb-live-find"));

import PouchVue from "pouch-vue";

Vue.use(PouchVue, {
  pouch: PouchDB
});
