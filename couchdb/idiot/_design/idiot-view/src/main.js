import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import pouch from "./pouch";
import i18n from "./i18n";

Vue.config.productionTip = false;

new Vue({
  router,
  pouch,
  i18n,
  render: h => h(App)
}).$mount("#app");
