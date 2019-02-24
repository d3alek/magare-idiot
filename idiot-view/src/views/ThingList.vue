<template>
  <div>
    <ThingListItem v-for="state in things" :state="state"/>
  </div>
</template>
<script>
import ThingListItem from "@/components/ThingListItem.vue";
export default {
  name: "thing-list",
  components: {
    ThingListItem
  },
  props: {
    things: Array
  }
};
</script>

