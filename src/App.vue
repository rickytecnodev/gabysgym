<template>
  <div id="app">
    <GymNavbar v-if="showNav" />
    <main class="main-content">
      <RouterView />
    </main>
    <GymBtnDow />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { RouterView } from 'vue-router';
import GymNavbar from '@/components/GymNavbar.vue';
import GymBtnDow from '@/components/GymBtnDow.vue';

const route = useRoute();
const showNav = computed(() => route.name !== 'GymLogin');
</script>

<style scoped></style>
<style>
/* Navbar fijo */
.navbar.fixed-top {
  z-index: 1030;
}
</style>
