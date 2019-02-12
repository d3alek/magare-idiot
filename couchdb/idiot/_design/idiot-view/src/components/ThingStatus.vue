<template>
  <div class="thing-status">
    <h3>{{ thing }}</h3>
    <pre>{{ JSON.stringify(state, null, 2) }}</pre>
  </div>
</template>

<script>

export default {
  name: "ThingStatus",
  props: {
    thing: String,
    state: Object
  },
  pouch: {
    state() {
      console.log(this.thing)
      return { 
        database: 'idiot',
        selector: {_id: this.thing},
        first: true
      }
    }
  },
  created: function() {
//  created: function() {
//      // Send all documents to the remote database, and stream changes in real-time. Note if you use filters you need to set them correctly for pouchdb and couchdb. You can set them for each direction separatly: options.push/options.pull. PouchDB might not need the same filter to push documents as couchdb to send the filtered requested documents.
      this.$pouch.sync('idiot', 'http://localhost:5984/idiot', {});
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
