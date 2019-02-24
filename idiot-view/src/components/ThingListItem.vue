<template>
  <div>
    <v-layout>
      <v-container :fill-height="true">
        <v-btn :to="'/details?thing='+thing">
          {{thing}}
        </v-btn>
        <Status :state="state" :short="true" />
      </v-container>
    </v-layout>
  </div>
</template>

<script>
import utils from "@/utils.vue";
import Status from "@/components/Status.vue";

export default {
  name: "thing-list-item",
  components: {
    Status
  },
  props: {
    state: Object,
  },
  computed: {
    thing() {
      return utils.parseThing(this.state._id);
    }
  }
}
</script>
