import { createRouter, createWebHistory } from "vue-router";
import Login from "./views/login.vue";
import Live from "./views/live.vue";
import NotFound from "./views/NotFound.vue";

const routes = [
  { path: "/", component: Login },
  { path: "/login", component: Login },
  { path: "/live", component: Live, meta: { requiresAuth: true } },
  { path: "/:pathMatch(.*)*", component: NotFound }, // ← fallback 404
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("access_token");

  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else if (to.path === "/login" && token) {
    next("/live");
  } else {
    next();
  }
});

export default router;
