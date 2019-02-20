<template>
  <div class="status item">
    <div v-if="short">
      <span v-if="status.text" :class="status.text"/>
    </div>
    <div v-else>
      <span v-if="status.text" :class="status.text">{{
        localize(status.text).slice(1)
      }}</span>
      <span v-if="status.since"> от {{ status.since }}</span>
    </div>
  </div>
</template>

<script>
const ASSUME_DOWN_AFTER_MINUTES = 5;

export default {
  name: "Status",
  props: {
    state: Object,
    short: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    status: function() {
      if (
        !this.state ||
        !this.state.reported ||
        !this.state.reported.timestamp
      ) {
        return "unknown";
      }
      var reported = this.state.reported;

      var reported_utc = new Date(reported.timestamp);
      var reported_millis = reported_utc.getTime(); // enchanted utc time in millis
      var now_millis = new Date().getTime(); // current utc time in millis
      if (now_millis - reported_millis > ASSUME_DOWN_AFTER_MINUTES * 1000 * 60) {
        return {
          text: "down",
          since: reported_utc.toLocaleString()
        };
      } else {
        return {
          text: "up",
          since: null
        };
      }
    }
  },
  methods: {
    localize: function localize(s) {
      if (s === "unknown") {
        return "грешка";
      }
      if (s === "up") {
        return "живо";
      }
      if (s === "down") {
        return "неизвестно";
      }

      console.log("Do not know how to localize " + s);
      return "грешка";
    }
  }
};
</script>

<style scoped>
.up:before {
  content: "ж";
  -webkit-border-radius: 10px;
  border-radius: 20px;
  border: none;
  color: #4caf50;
  font-size: 20px;
  text-align: center;
  animation: glowing-green 1500ms infinite;
  width: 25px;
  height: 25px;
  display: inline-block;
}

.down:before {
  content: "н";
  -webkit-border-radius: 10px;
  border-radius: 20px;
  border: none;
  color: #ad1717;
  font-size: 20px;
  text-align: center;
  width: 15px;
  height: 25px;
  display: inline-block;
}

.error:before {
  content: "г";
  -webkit-border-radius: 10px;
  border-radius: 30px;
  border: none;
  color: #9e9e9e;
  font-size: 20px;
  text-align: center;
  width: 15px;
  height: 25px;
  display: inline-block;
}
</style>
