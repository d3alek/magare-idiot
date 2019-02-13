<template>
  <div class="details">
    <h3>{{ thing }}</h3>
    <ThingStatus :state="state" />
    <pre>{{ JSON.stringify(state, null, 2) }}</pre>
  </div>
</template>

<script>
import ThingStatus from "@/components/ThingStatus.vue";

export default {
  name: "thing-details",
  components: {
    //HelloWorld
    ThingStatus
  },
  pouch: {
    state() {
      return { 
        database: 'idiot',
        selector: {_id: this.thing},
        first: true
      }
    }
  },
  computed: {
    thing: function() {
      return this.$route.query.thing;
    }
  },
  created: function() {
  // Send all documents to the remote database, and stream changes in real-time. Note if you use filters you need to set them correctly for pouchdb and couchdb. You can set them for each direction separatly: options.push/options.pull. PouchDB might not need the same filter to push documents as couchdb to send the filtered requested documents.
      this.$pouch.sync('idiot', 'http://localhost:5984/idiot', {});
    }
};
</script>
