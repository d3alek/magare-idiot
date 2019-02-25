<template>
  <v-list-tile>
    <v-list-tile-action>
      <v-btn flat icon
        :loading="active">
        <v-icon>{{active ? "active" : (paused ? "done" : "")}}</v-icon>
      </v-btn>
    </v-list-tile-action>
    <v-list-tile-title>{{this.name}}</v-list-tile-title>
  </v-list-tile>
</template>

<script>

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
    }
  },
  computed: {
    latestEvent() {
      if (this.events.length) {
        return this.events[this.events.length-1];
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
        if (this.events[i].info) {
          return this.events[i].info.docs_written;
        }
      }

      return 0;
    }
  },
  created() {
    this.$on('pouchdb-db-created', (e) => {
      this.events.push({created:true});
    });
    this.$on('pouchdb-pull-active', (e) => {
      this.events.push(e);
    });
    this.$on('pouchdb-pull-paused', (e) => {
      this.events.push(e);
    });
    this.$on('pouchdb-pull-change', (e) => {
      this.events.push(e);
    });
    this.startPull();
  },
  methods: {
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
