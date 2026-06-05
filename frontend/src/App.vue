<template>
  <!-- Sprint 0 stub — проверка что контейнер поднялся и Vue работает -->
  <!-- Sprint 1 заменит этот файл полноценным приложением -->
  <div class="stub">
    <h1>10:30 AM</h1>
    <p class="status">✅ Docker-окружение работает</p>
    <p class="info">Frontend: <strong>localhost:5173</strong></p>
    <p class="info">Backend:  <strong>localhost:3001/api/health</strong></p>
  </div>
</template>

<script setup>
// Sprint 0: заглушка. Логика появится в Sprint 1.
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #121314;
  color: #e4e2e2;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.stub {
  text-align: center;
}

h1 {
  font-size: 80px;
  font-weight: 700;
  letter-spacing: -2px;
  color: #ffffff;
  margin-bottom: 24px;
}

.status {
  font-size: 18px;
  color: #c4c7c8;
  margin-bottom: 32px;
}

.info {
  font-size: 14px;
  color: #444748;
  margin-bottom: 8px;
}

strong {
  color: #c4c7c8;
}
</style>
