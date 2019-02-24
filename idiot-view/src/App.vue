<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span>Idiot</span>
        <span class="font-weight-light">Intelligent Device IoT</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn router to="/">
        {{$t("Home")}}
      </v-btn>
      <v-btn router to="/list">
        {{$t("Things")}}
      </v-btn>
      <v-btn router to="/about">
        {{$t("About")}}
      </v-btn>
      <Language />
      <Magare :things="things" :pullRequests="pullRequests"/>
    </v-toolbar>
    <v-content>
      <router-view :things="things" :pullRequestHandler="pullRequestHandler"/>
    </v-content>
  </v-app>
</template>

<script>

import Language from "@/components/Language.vue";
import Magare from "@/components/Magare.vue";

const SELECTOR = {
  database: "idiot",
  selector: {
    _id: {
      $gt: "thing/",
      $lt: "thing\\"
    }
  },
  sort: [
    "_id"
  ]
};

export default {
  components: {
    Language,
    Magare
  },
  data() {
    return {
      things: [],
      pullRequests: {}
    }
  },
  pouch: {
    things() {
      return SELECTOR;
    }
  },
  created: function() {
    this.$pouch.pull("idiot", process.env.VUE_APP_DB_URL, {
      selector: SELECTOR.selector,
      sort: SELECTOR.sort,
      live: true,
      retry: true
    });
  },
  methods: {
    pullRequestHandler(toDatabase, options) {
      if (this.pullRequests[toDatabase]) {
        console.error("Multiple pull requests to the same databvase are not supported yet!");
      }
      this.$set(this.pullRequests, toDatabase, options);
    }
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
