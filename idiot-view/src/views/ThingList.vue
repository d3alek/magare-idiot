<template>
  <div>
    <ThingListItem v-for="state in things" :state="state"/>
  </div>
</template>
<script>
import ThingListItem from "@/components/ThingListItem.vue";
const SELECTOR = {
  _id: {
    $gt: "thing/",
    $lt: "thing\\"
  },
};
export default {
  name: "thing-list",
  components: {
    ThingListItem
  },
  pouch: {
    things() {
      return {
        database: "idiot",
        selector: SELECTOR
      }
    }
  },
  created: function() {
    this.$pouch.sync("idiot", process.env.VUE_APP_DB_URL, {
      selector: SELECTOR 
    });
  }
};
</script>

