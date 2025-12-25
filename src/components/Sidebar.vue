<template>
  <div
    class="sidebar bg-dark text-white p-3"
    style="width: 250px; min-height: 100vh"
  >
    <h5 class="mb-3">My Dashboard</h5>
    <ul class="nav flex-column">
      <li class="nav-item mb-2">
        <a class="nav-link text-white" href="/live">Live</a>
      </li>
      <li class="nav-item">
        <button class="btn btn-sm btn-danger w-100" @click="$emit('logout')">
          Logout
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
/* Sidebar tidak perlu data reactive kompleks,
   bisa terima event dari parent via $emit */
</script>

<style scoped>
.sidebar a.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
</style>
