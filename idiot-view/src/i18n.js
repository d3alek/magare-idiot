import Vue from "vue";
import i18next from "i18next";
import VueI18Next from "@panter/vue-i18next";

Vue.use(VueI18Next);

i18next.init({
  lng: "bg",
  resources: {
    bg: {
      translation: {
        minutes: "минути",
        hours: "часове",
        days: "дни",
        Home: 'Начало',
        Details: 'Детайли',
        About: 'За нас'
      }
    }
  }
});

export default new VueI18Next(i18next);
