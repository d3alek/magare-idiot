<template>
  <div class="magare">
    <v-layout>
      <v-flex>
        <v-menu>
          <v-btn icon
            slot="activator"
            :loading="loading">
            <v-badge overlap :color="fillColor">
              <span slot="badge">
                {{oldSensesWrite.length}}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg"
                  :height="height"
                  viewBox="0 0 185 181"
                  role="presentation"
                  >
                  <g :fill="fillColor" transform="translate(-258.82 -344.62)">
                    <magare-path/>
                  </g>
              </svg>
            </v-badge>
          </v-btn>
          <v-list>
            <v-list-tile>
              <v-list-tile-action>
                <v-switch v-model="housekeeper" color="purple"></v-switch>
              </v-list-tile-action>
              <v-list-tile-title>Housekeeping</v-list-tile-title>
            </v-list-tile>
            <magare-action v-for="(action, db) in pullRequests" :key="db" :action="action" :toDatabase="db"/>
          </v-list>
        </v-menu>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>

import moment from "moment";
import _ from "underscore";
import MagarePath from "@/components/MagarePath.vue";
import MagareAction from "@/components/MagareAction.vue";
import utils from "@/utils.vue";

const REMOTE_DB = process.env.VUE_APP_DB_URL
const COLOR_ERROR = 'red';
const COLOR_CONNECTED = 'green';

export default {
  name: "Magare",
  components: {
    MagarePath,
    MagareAction
  },
  props: {
    things: Array,
    pullRequests: Object
  },
  data() {
    return {
      height: "30px",
      fillColor: "gray",
      loading: false,
      oldSensesWrite: [],
      housekeeper: false,
      livePulls: {},
      livePullStates: {},
    }
  },
  watch: {
    //pullRequests: {
    //  handler: function(e) {this.updatePullRequests(e)},
    //  deep: true
    //},
    things: function (val) {return this.findOld},
    oldSensesWrite: function (val) { return this.performHousekeeping()},
    housekeeper: function (val) { return this.findOld()}
  },
  mounted() {
    this.findOld();
  },
  created() {
  },
  methods: {
    updatePullState: function(e) {
      var state = this.livePullStates[e.db];
      if (!state) {
        state = {};
      }

      if (e.active) {
        state.active = true;
        state.paused = false;
      }
      else if (e.paused) {
        state.active = false;
        state.paused = true;
      }
      else if (e.info) {
        if (!state.docs_written) {
          state.docsWritten = 0;
        }
        state.docsWritten += e.info.docs_written;
      }
      else {
        console.error("cannot handle event");
        console.error(e);
      }
      this.$set(this.livePullStates, e.db, state);
    },
    updatePullRequests: function(pullRequests) {
      var pull, newPull;
      const existingPulls = _.intersection(Object.keys(pullRequests), Object.keys(this.livePulls));
      for (pull of existingPulls) {
        console.log(`restart pull ${pull}`);
        this.livePulls[pull].cancel();
        this.$set(this.livePulls, pull, this.$pouch.pull("idiot", REMOTE_DB, pullRequests[pull]));
        this.updatePullState({paused: true, db: pull});
      }

      const newPulls = _.difference(Object.keys(pullRequests), Object.keys(this.livePulls));

      for (pull of newPulls) {
        console.log(`start pull ${pull}`);
        this.$set(this.livePulls, pull, this.$pouch.pull("idiot", REMOTE_DB, pullRequests[pull]));
        this.updatePullState({paused: true, db: pull});
      }

      const removedPulls = _.difference(Object.keys(this.livePulls), Object.keys(pullRequests));

      for (pull of removedPulls) {
        console.log(`stop pull ${pull}`);
        this.livePulls[pull].live.cancel();
        this.$delete(this.livePulls, pull);
        this.$delete(this.livePullStates, pull);
      }
    },
    performHousekeeping: function() {
      if (!this.housekeeper || this.oldSensesWrite.length === 0) {
        return;
      }
      const log = (s) => console.log("housekeeping: " + s)
      const error = (s) => console.error("housekeeping: " + s)
      log(`delete ${this.oldSensesWrite.length} documents`)
      const deleteDocs = this.oldSensesWrite.map((d) => {
        return {
        _id: d._id,
        _rev: d._rev,
        _deleted: true}
      });
      this.loading = true;
      this.$pouch.bulkDocs(REMOTE_DB, deleteDocs).then((result) => {
        this.loading = false;
        const deleted = result.filter((r) => r.ok);
        log(`deleted ${deleted.length} documents`);
        this.findOld();
      }).catch((error) => {
        this.loading = false;
        error("bulkDocs delete request failed");
        error(error);
      });
    },
    findOld: function() {
      const log = (s) => console.log("findOld: " + s)
      const error = (s) => console.error("findOld: " + s)

      if (!this.housekeeper) {
        return;
      }
      if (!this.things) {
        return;
      }

      const twoDaysAgo = moment().utc().subtract(2, 'days');
      const twoDaysOrOlderSelectors = this.things.map(t => {
        const name = utils.parseThing(t._id);
        return {
          _id: {
            $lt: "sensesWrite/"+name+'$'+twoDaysAgo.format(),
            $gt: "sensesWrite/"+name
          }
        } });

      const vm = this;
      this.loading = true;
      this.$pouch.find(REMOTE_DB, {
        selector: {
          $or: twoDaysOrOlderSelectors
        },
        fields: ["_id", "_rev"],
        limit: 1000
      }).then((result) => {
        log(`found ${result.docs.length}`);
        this.loading = false;
        vm.oldSensesWrite = result.docs;
      }).catch((error) => {
        this.loading = false;
        error(error);
      });
    }
  }
}
</script>

<style scoped>
svg {
  padding: 0 16px
}
</style>
