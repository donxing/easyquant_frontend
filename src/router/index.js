import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/stocks',
    name: 'Stocks',
    component: () => import('../views/Stocks.vue')
  },
  {
    path: '/market',
    name: 'Market',
    component: () => import('../views/Market.vue')
  },
  {
    path: '/backtest',
    name: 'Backtest',
    component: () => import('../views/Backtest.vue')
  },
  {
    path: '/backtest2000',
    name: 'Backtest2000',
    component: () => import('../views/Backtest2000.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router