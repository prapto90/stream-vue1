import { createApp } from "vue";
import App from "./App.vue"; // App.vue bisa jadi wrapper
import router from "./router";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

createApp(App).use(router).mount("#app");
