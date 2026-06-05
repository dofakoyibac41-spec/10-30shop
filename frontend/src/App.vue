<template>
  <NavBar />
  <main>
    <RouterView />
  </main>
  <Footer />
</template>

<script setup>
import NavBar from './components/NavBar.vue';
import Footer from './components/Footer.vue';
</script>

<style>
/* ─── Базовый сброс — Sprint 2 заменит на дизайн-токены ─── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #121314;
  color: #e4e2e2;
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}

main {
  padding: 24px;
}
</style>
