<template>
  <div class="market">
    <h1>市场总结</h1>
    <div id="search-container">
      <label>
        日期范围:
        <vue-date-picker
          v-model="dateRange"
          range
          format="yyyy-MM-dd"
          placeholder="选择日期范围"
          :locale="locale"
          :enable-time-picker="false"
          :clearable="true"
          class="date-picker"
        />
      </label>
      <button @click="loadMarketData" :disabled="loading || !dateRange">
        {{ loading ? '加载中...' : '搜索' }}
      </button>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="marketData.length > 0" class="charts-container">
      <div class="powerline-section">
        <h2>POWERLINE 总和</h2>
        <div ref="powerlineChart" id="powerline-chart"></div>
      </div>
      <div class="volume-section">
        <h2>成交量总和</h2>
        <div ref="volumeChart" id="volume-chart"></div>
      </div>
      <div class="portfolio-section">
        <h2>平均投资组合价值</h2>
        <div ref="portfolioChart" id="portfolio-chart"></div>
      </div>
      <div class="amount-section">
        <h2>成交额总和</h2>
        <div ref="amountChart" id="amount-chart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import api from '../services/api'

export default {
  name: 'Market',
  components: {
    VueDatePicker
  },
  data() {
    return {
      dateRange: null,
      powerlineChart: null,
      volumeChart: null,
      portfolioChart: null,
      amountChart: null,
      loading: false,
      error: '',
      locale: 'zh-CN',
      marketData: []
    }
  },
  mounted() {
    this.loadQueryParams()
    this.$nextTick(() => {
      if (this.$refs.powerlineChart && this.$refs.powerlineChart.offsetWidth > 0) {
        this.powerlineChart = echarts.init(this.$refs.powerlineChart)
      } else {
        console.warn('powerlineChart DOM not ready or has invalid dimensions during mounted')
      }
      if (this.$refs.volumeChart && this.$refs.volumeChart.offsetWidth > 0) {
        this.volumeChart = echarts.init(this.$refs.volumeChart)
      } else {
        console.warn('volumeChart DOM not ready or has invalid dimensions during mounted')
      }
      if (this.$refs.portfolioChart && this.$refs.portfolioChart.offsetWidth > 0) {
        this.portfolioChart = echarts.init(this.$refs.portfolioChart)
      } else {
        console.warn('portfolioChart DOM not ready or has invalid dimensions during mounted')
      }
      if (this.$refs.amountChart && this.$refs.amountChart.offsetWidth > 0) {
        this.amountChart = echarts.init(this.$refs.amountChart)
      } else {
        console.warn('amountChart DOM not ready or has invalid dimensions during mounted')
      }
      window.addEventListener('resize', this.handleResize)
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    if (this.powerlineChart) {
      this.powerlineChart.dispose()
      this.powerlineChart = null
    }
    if (this.volumeChart) {
      this.volumeChart.dispose()
      this.volumeChart = null
    }
    if (this.portfolioChart) {
      this.portfolioChart.dispose()
      this.portfolioChart = null
    }
    if (this.amountChart) {
      this.amountChart.dispose()
      this.amountChart = null
    }
  },
  methods: {
    handleResize() {
      if (this.powerlineChart) {
        this.powerlineChart.resize()
      }
      if (this.volumeChart) {
        this.volumeChart.resize()
      }
      if (this.portfolioChart) {
        this.portfolioChart.resize()
      }
      if (this.amountChart) {
        this.amountChart.resize()
      }
    },
    loadQueryParams() {
      const { startDate, endDate } = this.$route.query
      if (startDate && endDate) {
        this.dateRange = [new Date(startDate), new Date(endDate)]
        this.loadMarketData()
      }
    },
    async loadMarketData() {
      if (!this.dateRange || !this.dateRange[0] || !this.dateRange[1]) {
        this.error = '请选择日期范围'
        return
      }

      this.loading = true
      this.error = ''
      this.marketData = []
      if (this.powerlineChart) this.powerlineChart.clear()
      if (this.volumeChart) this.volumeChart.clear()
      if (this.portfolioChart) this.portfolioChart.clear()
      if (this.amountChart) this.amountChart.clear()

      try {
        let apiUrl = '/api/market/summary'
        const params = []
        if (this.dateRange && this.dateRange[0]) {
          const startDate = this.formatDate(this.dateRange[0])
          params.push(`start_date=${startDate}`)
        }
        if (this.dateRange && this.dateRange[1]) {
          const endDate = this.formatDate(this.dateRange[1])
          params.push(`end_date=${endDate}`)
        }
        if (params.length > 0) apiUrl += `?${params.join('&')}`

        const response = await api.get(apiUrl)
        const marketData = response.data.summary

        if (marketData && marketData.length > 0) {
          this.marketData = marketData
        } else {
          this.marketData = []
          this.error = '未找到市场总结数据'
          return
        }

        this.$nextTick(() => {
          if (!this.powerlineChart && this.$refs.powerlineChart && this.$refs.powerlineChart.offsetWidth > 0) {
            try {
              this.powerlineChart = echarts.init(this.$refs.powerlineChart)
            } catch (e) {
              console.error('Failed to initialize powerlineChart:', e)
              this.error = '无法初始化POWERLINE图，请刷新页面重试'
              return
            }
          }
          if (!this.volumeChart && this.$refs.volumeChart && this.$refs.volumeChart.offsetWidth > 0) {
            try {
              this.volumeChart = echarts.init(this.$refs.volumeChart)
            } catch (e) {
              console.error('Failed to initialize volumeChart:', e)
              this.error = '无法初始化成交量图，请刷新页面重试'
              return
            }
          }
          if (!this.portfolioChart && this.$refs.portfolioChart && this.$refs.portfolioChart.offsetWidth > 0) {
            try {
              this.portfolioChart = echarts.init(this.$refs.portfolioChart)
            } catch (e) {
              console.error('Failed to initialize portfolioChart:', e)
              this.error = '无法初始化投资组合图，请刷新页面重试'
              return
            }
          }
          if (!this.amountChart && this.$refs.amountChart && this.$refs.amountChart.offsetWidth > 0) {
            try {
              this.amountChart = echarts.init(this.$refs.amountChart)
            } catch (e) {
              console.error('Failed to initialize amountChart:', e)
              this.error = '无法初始化成交额图，请刷新页面重试'
              return
            }
          }
          if (
            this.powerlineChart && this.$refs.powerlineChart.offsetWidth > 0 &&
            this.volumeChart && this.$refs.volumeChart.offsetWidth > 0 &&
            this.portfolioChart && this.$refs.portfolioChart.offsetWidth > 0 &&
            this.amountChart && this.$refs.amountChart.offsetWidth > 0
          ) {
            this.renderCharts()
          } else {
            console.warn('Chart DOM not ready or has invalid dimensions')
          }
        })
      } catch (error) {
        this.marketData = []
        this.error = error.response?.data?.detail || '获取市场数据失败'
        console.error('操作失败:', error)
      } finally {
        this.loading = false
      }
    },
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    renderCharts() {
      if (!this.marketData.length) {
        if (this.powerlineChart) this.powerlineChart.clear()
        if (this.volumeChart) this.volumeChart.clear()
        if (this.portfolioChart) this.portfolioChart.clear()
        if (this.amountChart) this.amountChart.clear()
        return
      }

      // Validate and prepare data
      const validData = this.marketData.filter(item => {
        const isValid =
          item.date &&
          typeof item.POWERLINE === 'number' && !isNaN(item.POWERLINE) &&
          typeof item.volume === 'number' && !isNaN(item.volume) &&
          typeof item.portfolio === 'number' && !isNaN(item.portfolio) &&
          typeof item.amount === 'number' && !isNaN(item.amount)
        if (!isValid) {
          console.warn('Invalid market data point:', item)
        }
        return isValid
      })

      if (!validData.length) {
        this.error = '市场数据无效，无法渲染图表'
        return
      }

      const dates = validData.map(item => item.date)
      const powerline = validData.map(item => item.POWERLINE)
      const volume = validData.map(item => item.volume)
      const portfolio = validData.map(item => item.portfolio)
      const amount = validData.map(item => item.amount)

      // POWERLINE chart configuration (Line Chart)
      const powerlineOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const dataIndex = params[0].dataIndex
            const date = params[0].axisValue
            const value = params[0].data
            return `<div style="font-weight:bold">${date}</div>POWERLINE 总和: ${value.toFixed(2)}`
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: dates,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax'
        },
        yAxis: {
          scale: true,
          splitArea: { show: true },
          name: 'POWERLINE 总和',
          axisLine: { show: true },
          axisLabel: { show: true }
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            show: true,
            type: 'slider',
            top: '90%',
            start: 0,
            end: 100
          }
        ],
        series: [
          {
            name: 'POWERLINE',
            type: 'line',
            data: powerline,
            lineStyle: { color: '#1E90FF' }, // Blue
            symbol: 'circle',
            symbolSize: 6
          }
        ]
      }

      // Volume chart configuration (Bar Chart)
      const volumeOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const dataIndex = params[0].dataIndex
            const date = params[0].axisValue
            const value = params[0].data
            return `<div style="font-weight:bold">${date}</div>成交量总和: ${value.toFixed(2)}`
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: dates,
          scale: true,
          boundaryGap: true, // Enable boundary gap for bar chart
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax'
        },
        yAxis: {
          scale: true,
          splitArea: { show: true },
          name: '成交量总和',
          axisLine: { show: true },
          axisLabel: { show: true }
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            show: true,
            type: 'slider',
            top: '90%',
            start: 0,
            end: 100
          }
        ],
        series: [
          {
            name: '成交量',
            type: 'bar',
            data: volume,
            itemStyle: { color: '#5470C6' }, // Blue (same as Stocks.vue K-line volume)
            barWidth: '40%'
          }
        ]
      }

      // Portfolio chart configuration (Line Chart)
      const portfolioOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const dataIndex = params[0].dataIndex
            const date = params[0].axisValue
            const value = params[0].data
            return `<div style="font-weight:bold">${date}</div>平均投资组合: ${value.toFixed(2)}`
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: dates,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax'
        },
        yAxis: {
          scale: true,
          splitArea: { show: true },
          name: '平均投资组合价值',
          axisLine: { show: true },
          axisLabel: { show: true },
          min: 0 // No specific zero axis base required
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            show: true,
            type: 'slider',
            top: '90%',
            start: 0,
            end: 100
          }
        ],
        series: [
          {
            name: '投资组合',
            type: 'line',
            data: portfolio,
            lineStyle: { color: '#8A2BE2' }, // Purple (same as Stocks.vue)
            symbol: 'circle',
            symbolSize: 6
          }
        ]
      }

      // Amount chart configuration (Line Chart)
      const amountOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const dataIndex = params[0].dataIndex
            const date = params[0].axisValue
            const value = params[0].data
            return `<div style="font-weight:bold">${date}</div>成交额总和: ${value.toFixed(2)}`
          }
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '15%'
        },
        xAxis: {
          type: 'category',
          data: dates,
          scale: true,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax'
        },
        yAxis: {
          scale: true,
          splitArea: { show: true },
          name: '成交额总和',
          axisLine: { show: true },
          axisLabel: { show: true }
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            show: true,
            type: 'slider',
            top: '90%',
            start: 0,
            end: 100
          }
        ],
        series: [
          {
            name: '成交额',
            type: 'line',
            data: amount,
            lineStyle: { color: '#FF4500' }, // OrangeRed
            symbol: 'circle',
            symbolSize: 6
          }
        ]
      }

      try {
        this.powerlineChart.setOption(powerlineOption)
        this.volumeChart.setOption(volumeOption)
        this.portfolioChart.setOption(portfolioOption)
        this.amountChart.setOption(amountOption)
      } catch (e) {
        console.error('Failed to set chart options:', e)
        this.error = '图表渲染失败，请检查数据'
      }
    }
  }
}
</script>

<style scoped>
.market {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

#search-container {
  margin-bottom: 20px;
}

#search-container label {
  margin-right: 15px;
  display: inline-block;
  margin-bottom: 10px;
}

#search-container input,
#search-container .date-picker {
  padding: 8px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  vertical-align: middle;
}

#search-container .date-picker {
  display: inline-block;
  width: 200px;
}

#search-container button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

#search-container button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.powerline-section, .volume-section, .portfolio-section, .amount-section {
  width: 100%;
}

#powerline-chart, #volume-chart, #portfolio-chart, #amount-chart {
  width: 100%;
  height: 400px;
  min-height: 400px;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>