<template>
  <div v-if="thing" class="details">
    <div v-if="state && !Array.isArray(state)">
      <h3>{{ thing }}</h3>
      <Status :state="state" />
      <History :thing="thing" />
      <pre>{{ JSON.stringify(state, null, 2) }}</pre>
    </div>
    <div v-else>
      <h3>{{ thing }} не съществува</h3>
    </div>
  </div>
  <div v-else>
    <h3>Няма избрано устройство</h3>
  </div>
</template>

<script>
import Status from "@/components/Status.vue";
import History from "@/components/History.vue";

import PouchDB from 'pouchdb';

export default {
  name: "thing-details",
  components: {
    Status,
    History
  },
  pouch: {
    state() {
      if (this.thing) {
        return {
          database: "idiot",
          selector: { _id: this.thing },
          first: true
        };
      }
    }
  },
  computed: {
    thing: function() {
      return this.$route.query.thing;
    }
  },
  created: function() {
    this.$pouch.sync("idiot", process.env.VUE_APP_DB_URL, {
      selector: {
        _id: this.thing
      }
    });
  }
};
</script>
