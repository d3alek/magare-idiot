<template>
  <div class="details">
    <ThingStatus :thing="this.$route.query.thing" :state="{}" />
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import ThingStatus from "@/components/ThingStatus.vue";

export default {
  name: "thing-details",
  components: {
    //HelloWorld
    ThingStatus
  }
};
</script>
