<template>
  <v-list-tile>
    <v-list-tile-avatar>
      <v-btn flat icon
        :loading="active">
        <v-icon>{{active ? "active" : (paused ? "done" : "")}}</v-icon>
      </v-btn>
    </v-list-tile-avatar>
    <v-list-tile-content>
      <v-list-tile-title>
        {{name}}
      </v-list-tile-title>
    </v-list-tile-content>
    <v-list-tile-action>
      <v-dialog
        v-model="dialog"
        width="500"
        >
        <v-btn flat icon
          slot="activator"
          >
          <v-icon>info</v-icon>
        </v-btn>
        <v-card>
          <v-card-title
            class="headline grey lighten-2"
            primary-title
            >
            {{name}}
          </v-card-title>
          <v-card-text>
            {{active ? "Active" : "Paused"}} 
            <br>
            Total Docs: {{docCount}}
            <br>
            Docs Written this session: {{docsWritten}}
            <v-data-table
              :headers="headers"
              :items="events"
              >
              <template slot="items" slot-scope="props">
                <td>{{props.item.at.fromNow()}}</td>
                <td class="preview">{{props.item.data}}</td>
              </template>
            </v-data-table>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              flat
              @click="dialog = false"
              >
              Dismiss
            </v-btn>
            <v-btn
              color="red"
              flat
              @click="deleteDb"
              >
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>

import moment from "moment";

const REMOTE_DB = process.env.VUE_APP_DB_URL

export default {
  name: "magare-db",
  props: {
    name: String,
    pullOptions: Object
  },
  data() {
    return {
      events: [],
      dialog: false,
      docCount: null,
      headers: [
        {
          text: "at",
          align: 'left',
          sortable: true,
          value: "at"
        },
        {
          text: "data",
          align: 'left',
          sortable: false,
          value: "data"
        }
      ]
    }
  },
  computed: {
    latestEvent() { if (this.events.length) {
        return this.events[this.events.length-1].data;
      }
      else {
        return {};
      }
    },
    active() {
      return this.latestEvent.active || (this.latestEvent.info && this.latestEvent.info.ok);
    },
    paused() {
      return this.latestEvent.paused;
    },
    docsWritten() {
      for (var i = this.events.length-1; i >= 0; --i) {
        if (this.events[i].data.info) {
          return this.events[i].data.info.docs_written;
        }
      }

      return 0;
    }
  },
  created() {
    const makeEvent = (d) => {
      return {
        at: moment.utc(),
        data: d
      };
    };
    this.$on('pouchdb-db-created', (e) => {
      this.events.push(makeEvent({created:true}));
    });
    this.$on('pouchdb-pull-active', (e) => {
      this.events.push(makeEvent(e));
    });
    this.$on('pouchdb-pull-paused', (e) => {
      this.events.push(makeEvent(e));
    });
    this.$on('pouchdb-pull-change', (e) => {
      this.events.push(makeEvent(e));
    });
    this.startPull();
    this.loadInfo();
  },
  methods: {
    loadInfo() {
      this.$pouch.info(this.name).then( (r) =>
        this.docCount = r.doc_count
      );
    },
    deleteDb() {
      this.$pouch.destroy(this.name); // TODO do a then/catch
      this.dialog = false;
    },
    startPull() {
      if (this.pull) {
        console.log(`cancel old pull ${this.name} as pull options changed`);
        this.pull.cancel();
      }
      if (this.pullOptions) {
        console.log(`start new pull for ${this.name}`);
        this.pull = this.$pouch.pull(this.name, REMOTE_DB, this.pullOptions);
      }
      else {
        console.log(`pull options for ${this.name} is null - not starting a pull`);
      }
    }
  }
}
</script>

<style scoped>
.preview {
  white-space: nowrap;
  overflow: hidden;
}
</style>
