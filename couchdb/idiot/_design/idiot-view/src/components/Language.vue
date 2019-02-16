<template>
  <div class="langauge-changer">
    <button v-on:click="changeLanguage('bg')">БГ</button>
    <button v-on:click="changeLanguage('en')">EN</button>
  </div>
</template>

<script>

import i18next from 'i18next';

export default {
  name: "Language",
  methods: {
    changeLanguage(lang) {
      i18next.changeLanguage(lang);
    }
  }
}
</script>
