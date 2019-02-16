<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">{{$t("Home")}}</router-link> |
      <router-link to="/details">{{$t("Details")}}</router-link> |
      <router-link to="/about">{{$t("About")}}</router-link>
    </div>
    <Language />
    <router-view />
  </div>
</template>

<script>

import Language from "@/components/Language.vue";

export default {
  components: {
    Language
  }
}

</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
