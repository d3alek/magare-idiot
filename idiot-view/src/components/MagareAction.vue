<template>
  <v-list-tile>
    <v-list-tile-action>
      <v-btn flat icon
        :loading="active">
        <v-icon>{{active ? "active" : "done"}}</v-icon>
      </v-btn>
    </v-list-tile-action>
    <v-list-tile-title>{{db}}</v-list-tile-title>
  </v-list-tile>
</template>

<script>

const REMOTE_DB = process.env.VUE_APP_DB_URL

export default {
  name: "magare-action",
  props: {
    action: Object,
    toDatabase: String
  },
  data() {
    return {
      events: [{paused: true, db: this.toDatabase}]
    }
  },
  computed: {
    latestEvent() {
      return this.events[this.events.length-1];
    },
    active() {
      return !this.latestEvent.paused;
    },
    db() {
      return this.latestEvent.db;
    },
    docsWritten() {
      return this.events.reduce((partial_sum, a) => partial_sum + (a.info ? a.info.docs_written : 0), 0);
    }
  },
  created() {
    this.pull = this.$pouch.pull(this.toDatabase, REMOTE_DB, this.action);
    this.$on('pouchdb-pull-active', (e) => {
      this.events.push(e);
    });
    this.$on('pouchdb-pull-paused', (e) => {
      this.events.push(e);
    });
    this.$on('pouchdb-pull-change', (e) => {
      this.events.push(e);
    });
  }

}
</script>
