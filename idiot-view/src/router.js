import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import ThingDetails from "./views/ThingDetails.vue";
import ThingList from "./views/ThingList.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/list",
      name: "list",
      component: ThingList
    },
    {
      path: "/details",
      name: "details",
      component: ThingDetails
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    }
  ]
});
