<template>
  <!-- ─── Root App Layout ────────────────────────────────────────────────────
       NavBar (sticky) → main → Footer.
       Инлайн-стили Sprint 0/1 убраны — управление через глобальные CSS.
       ─────────────────────────────────────────────────────────────────────── -->
  <NavBar />

  <main class="app-main">
    <RouterView />
  </main>

  <Footer />
</template>

<script setup>
import NavBar from './components/NavBar.vue';
import Footer from './components/Footer.vue';
</script>

<style>
/* ─── App-level layout ───────────────────────────────────────────────────── */
/* min-height гарантирует что footer прижат к низу при коротком контенте */
.app-main {
  min-height: calc(100vh - var(--navbar-height));
}
</style>
