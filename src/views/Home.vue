<template>
  <div class="home">
    <h1>Welcome to the Stock Analysis Platform</h1>
    <p>Explore stock data, perform backtests, and analyze trading strategies.</p>
    <div class="actions">
      <router-link to="/stocks" class="btn">View Stocks</router-link>
      <router-link to="/market" class="btn">Market Overview</router-link>
      <router-link to="/backtest" class="btn">Run Backtest</router-link>
      <router-link to="/backtest2000" class="btn">Run CSI2000 Backtest</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

p {
  font-size: 16px;
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
}

.btn:hover {
  background-color: #0056b3;
}
</style>