<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-4">
        <div class="card p-4">
          <h3 class="card-title text-center mb-3">Login</h3>
          <form @submit.prevent="login">
            <div class="mb-3">
              <input
                v-model="username"
                type="text"
                class="form-control"
                placeholder="Username"
              />
            </div>
            <div class="mb-3">
              <input
                v-model="password"
                type="password"
                class="form-control"
                placeholder="Password"
              />
            </div>
            <button
              class="btn btn-primary w-100"
              type="submit"
              :disabled="loading"
            >
              {{ loading ? "Loading..." : "Login" }}
            </button>
            <div v-if="error" class="alert alert-danger mt-2">{{ error }}</div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// Ambil env Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// console.log("API_BASE_URL:", API_BASE_URL);

// Reactive state
const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

// Auto redirect jika token sudah ada
onMounted(() => {
  const token = localStorage.getItem("access_token");
  if (token) {
    window.location.href = "live";
  }
});

// Fungsi login
const login = async () => {
  error.value = "";
  loading.value = true;

  try {
    // const res = await fetch(`/api/auth/token`, {
    const res = await fetch(`${API_BASE_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      error.value = data.error || "Login gagal";
      return;
    }

    // simpan token
    localStorage.setItem("access_token", data.access_token);

    // redirect
    window.location.href = "live";
  } catch (err) {
    error.value = "Server tidak dapat dihubungi";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* .container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
} */
</style>
