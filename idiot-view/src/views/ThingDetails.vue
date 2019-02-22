<template>
  <v-container>
    <v-layout v-if="thing" class="details">
      <span v-if="state && !Array.isArray(state)">
        <v-flex xs12>{{ thing }}</v-flex>
        <v-flex xs12>
          <Status :state="state" />
        </v-flex>
        <v-flex xs12>
          <v-treeview :items="treeViewItems" :item-text="'id'">
            <template slot="label" slot-scope="{ item }">
              <span class="">{{ item.id ? item.id : "config" }}:</span>
              <span class="">{{ item.value }}</span>
            </template>
          </v-treeview>
        </v-flex>
        <v-flex xs12>
          <History :thing="thing" />
        </v-flex>
      </span>
      <span v-else>
        <h3>{{ thing }} не съществува</h3>
      </span>
    </v-layout>
    <v-layout v-else>
      <h3>Няма избрано устройство</h3>
    </v-layout>
  </v-container>
</template>

<script>
import Status from "@/components/Status.vue";
import History from "@/components/History.vue";

function transform(el) {
  var transformed = {};
  if (Array.isArray(el)) {
    transformed.children = el.map(transform);
    if (transformed.children.length === 0) {
      transformed.value = [];
    }
  }
  else if (typeof(el) === 'object') {
    transformed.children = [];
    for (var key in el) {
      var child = transform(el[key])
      child.id = key;
      transformed.children.push(child);
    }
    if (transformed.children.length === 0) {
      transformed.value = {};
    }
  }
  else {
    transformed.value = JSON.stringify(el);
  }
  return transformed;
}

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
          selector: {
            _id: 'thing/' + this.thing
          },
          first: true
        };
      }
    }
  },
  computed: {
    thing: function() {
      return this.$route.query.thing;
    },
    treeViewItems: function() {
      return [transform(this.state.reported.state.config)];
    }
  },
  created: function() {
    this.$pouch.sync("idiot", process.env.VUE_APP_DB_URL, {
      selector:  {
        _id: 'thing/' + this.thing
      },
      first: true
    });
  }
};
</script>
