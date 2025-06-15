<template>
  <div id="app">
    <nav class="navbar">
      <router-link to="/">Home</router-link>
      <router-link to="/stocks">Stocks</router-link>
      <router-link to="/market">Market</router-link>
      <router-link to="/backtest">Backtest</router-link>
      <router-link to="/backtest2000">CSI2000 Backtest</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.navbar {
  background-color: #f8f9fa;
  padding: 10px;
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
}

.navbar a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.navbar a:hover {
  text-decoration: underline;
}
</style>