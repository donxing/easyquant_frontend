<template>
  <div class="stocks">
    <h1>个股波段分析</h1>
    <div id="search-container">
      <label>
        股票代码:
        <input
          type="text"
          v-model="stockCode"
          placeholder="请输入股票代码"
          @keyup.enter="loadStockData"
        />
      </label>
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
      <button @click="loadStockData" :disabled="loading || !stockCode || !dateRange">
        {{ loading ? '加载中...' : '搜索' }}
      </button>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="stockData.length > 0" class="charts-container">
      <div class="kline-section">
        <h2>K线图</h2>
        <div ref="klineChart" id="kline-chart"></div>
      </div>
      <div class="powerline-section">
        <h2>顶底趋势</h2>
        <div ref="powerlineChart" id="powerline-chart"></div>
      </div>
      <div class="xys-section">
        <h2>捕捞季节</h2>
        <div ref="xysChart" id="xys-chart"></div>
      </div>
      <div class="portfolio-section">
        <h2>投资回测</h2>
        <div ref="portfolioChart" id="portfolio-chart"></div>
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
  name: 'Stocks',
  components: {
    VueDatePicker
  },
  data() {
    return {
      stockCode: '',
      dateRange: null,
      klineChart: null,
      powerlineChart: null,
      xysChart: null,
      portfolioChart: null,
      loading: false,
      error: '',
      locale: 'zh-CN',
      stockData: []
    }
  },
  mounted() {
    this.loadQueryParams()
    this.$nextTick(() => {
      if (this.$refs.klineChart && this.$refs.klineChart.offsetWidth > 0) {
        this.klineChart = echarts.init(this.$refs.klineChart)
      } else {
        console.warn('klineChart DOM not ready or has invalid dimensions during mounted')
      }
      if (this.$refs.powerlineChart && this.$refs.powerlineChart.offsetWidth > 0) {
        this.powerlineChart = echarts.init(this.$refs.powerlineChart)
      } else {
        console.warn('powerlineChart DOM not ready or has invalid dimensions during mounted')
      }
      if (this.$refs.xysChart && this.$refs.xysChart.offsetWidth > 0) {
        this.xysChart = echarts.init(this.$refs.xysChart)
      } else {
        console.warn('xysChart DOM not ready or has invalid dimensions during mounted')
      }
      if (this.$refs.portfolioChart && this.$refs.portfolioChart.offsetWidth > 0) {
        this.portfolioChart = echarts.init(this.$refs.portfolioChart)
      } else {
        console.warn('portfolioChart DOM not ready or has invalid dimensions during mounted')
      }
      window.addEventListener('resize', this.handleResize)
    })
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    if (this.klineChart) {
      this.klineChart.dispose()
      this.klineChart = null
    }
    if (this.powerlineChart) {
      this.powerlineChart.dispose()
      this.powerlineChart = null
    }
    if (this.xysChart) {
      this.xysChart.dispose()
      this.xysChart = null
    }
    if (this.portfolioChart) {
      this.portfolioChart.dispose()
      this.portfolioChart = null
    }
  },
  methods: {
    handleResize() {
      if (this.klineChart) {
        this.klineChart.resize()
      }
      if (this.powerlineChart) {
        this.powerlineChart.resize()
      }
      if (this.xysChart) {
        this.xysChart.resize()
      }
      if (this.portfolioChart) {
        this.portfolioChart.resize()
      }
    },
    loadQueryParams() {
      const { stockCode, startDate, endDate } = this.$route.query
      if (stockCode) {
        this.stockCode = stockCode
      }
      if (startDate && endDate) {
        this.dateRange = [new Date(startDate), new Date(endDate)]
      }
      if (this.stockCode && this.dateRange) {
        this.loadStockData()
      }
    },
    async loadStockData() {
      if (!this.stockCode.trim()) {
        this.error = '请输入股票代码'
        return
      }
      if (!this.dateRange || !this.dateRange[0] || !this.dateRange[1]) {
        this.error = '请选择日期范围'
        return
      }

      this.loading = true
      this.error = ''
      this.stockData = []
      if (this.klineChart) this.klineChart.clear()
      if (this.powerlineChart) this.powerlineChart.clear()
      if (this.xysChart) this.xysChart.clear()
      if (this.portfolioChart) this.portfolioChart.clear()

      try {
        let apiUrl = `/api/stocks/${this.stockCode.trim()}`
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

        const stockResponse = await api.get(apiUrl)
        const stockData = stockResponse.data

        if (stockData && stockData.data && stockData.data.length > 0) {
          this.stockData = stockData.data
        } else {
          this.stockData = []
          this.error = '未找到该股票的数据'
          return
        }

        this.$nextTick(() => {
          if (!this.klineChart && this.$refs.klineChart && this.$refs.klineChart.offsetWidth > 0) {
            try {
              this.klineChart = echarts.init(this.$refs.klineChart)
            } catch (e) {
              console.error('Failed to initialize klineChart:', e)
              this.error = '无法初始化K线图，请刷新页面重试'
              return
            }
          }
          if (!this.powerlineChart && this.$refs.powerlineChart && this.$refs.powerlineChart.offsetWidth > 0) {
            try {
              this.powerlineChart = echarts.init(this.$refs.powerlineChart)
            } catch (e) {
              console.error('Failed to initialize powerlineChart:', e)
              this.error = '无法初始化POWERLINE图，请刷新页面重试'
              return
            }
          }
          if (!this.xysChart && this.$refs.xysChart && this.$refs.xysChart.offsetWidth > 0) {
            try {
              this.xysChart = echarts.init(this.$refs.xysChart)
            } catch (e) {
              console.error('Failed to initialize xysChart:', e)
              this.error = '无法初始化捕捞季节图，请刷新页面重试'
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
          if (
            this.klineChart && this.$refs.klineChart.offsetWidth > 0 &&
            this.powerlineChart && this.$refs.powerlineChart.offsetWidth > 0 &&
            this.xysChart && this.$refs.xysChart.offsetWidth > 0 &&
            this.portfolioChart && this.$refs.portfolioChart.offsetWidth > 0
          ) {
            this.renderCharts()
          } else {
            console.warn('Chart DOM not ready or has invalid dimensions')
          }
        })
      } catch (error) {
        this.stockData = []
        this.error = error.response?.data?.detail || '获取数据失败'
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
      if (!this.stockData.length) {
        if (this.klineChart) this.klineChart.clear()
        if (this.powerlineChart) this.powerlineChart.clear()
        if (this.xysChart) this.xysChart.clear()
        if (this.portfolioChart) this.portfolioChart.clear()
        return
      }

      // Validate and prepare data
      const validData = this.stockData.filter(item => {
        const isValid =
          item.date &&
          typeof item.open === 'number' && !isNaN(item.open) &&
          typeof item.close === 'number' && !isNaN(item.close) &&
          typeof item.low === 'number' && !isNaN(item.low) &&
          typeof item.high === 'number' && !isNaN(item.high) &&
          typeof item.volume === 'number' && !isNaN(item.volume) &&
          typeof item.POWERLINE === 'number' && !isNaN(item.POWERLINE) &&
          typeof item.XYS1 === 'number' && !isNaN(item.XYS1) &&
          typeof item.XYS2 === 'number' && !isNaN(item.XYS2) &&
          typeof item.portfolio === 'number' && !isNaN(item.portfolio)
        if (!isValid) {
          console.warn('Invalid data point:', item)
        }
        return isValid
      })

      if (!validData.length) {
        this.error = '数据无效，无法渲染图表'
        return
      }

      const dates = validData.map(item => item.date)
      const klineData = validData.map(item => [
        item.open,
        item.close,
        item.low,
        item.high
      ])
      const volumes = validData.map(item => item.volume)
      const powerline = validData.map(item => item.POWERLINE)
      const xys1 = validData.map(item => item.XYS1)
      const xys2 = validData.map(item => item.XYS2)
      const portfolio = validData.map(item => item.portfolio)

      // Generate markers for buy/sell actions
      const markers = validData.map((item, index) => {
        if (item.action === 'buy') {
          return {
            name: 'BUY',
            coord: [index, item.low],
            symbol: 'arrow',
            symbolSize: 12,
            symbolRotate: 0,
            itemStyle: { color: 'red' },
            label: { show: false },
            tooltip: { value: `买入 @ ${item.low.toFixed(2)}` }
          }
        } else if (item.action === 'sell') {
          return {
            name: 'SELL',
            coord: [index, item.high],
            symbol: 'arrow',
            symbolSize: 12,
            symbolRotate: -180,
            itemStyle: { color: 'green' },
            label: { show: false },
            tooltip: { value: `卖出 @ ${item.high.toFixed(2)}` }
          }
        }
        return null
      }).filter(marker => marker !== null)

      // K-line chart configuration
      const klineOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross' },
          formatter: function (params) {
            const dataIndex = params[0].dataIndex
            const date = params[0].axisValue
            const data = validData[dataIndex]
            let html = `<div style="font-weight:bold">${date}</div>`
            html += `开盘: ${data.open.toFixed(2)}<br>`
            html += `收盘: ${data.close.toFixed(2)}<br>`
            html += `最高: ${data.high.toFixed(2)}<br>`
            html += `最低: ${data.low.toFixed(2)}<br>`
            html += `成交量: ${data.volume.toFixed(2)}<br>`
            html += `操作: ${data.action || '无'}<br>`
            const signals = markers.filter(m => m.coord[0] === dataIndex)
            if (signals.length > 0) {
              html += `<br>信号: ${signals.map(s => s.tooltip.value).join(', ')}`
            }
            return html
          }
        },
        axisPointer: {
          link: { xAxisIndex: 'all' },
          label: { backgroundColor: '#777' }
        },
        grid: [
          { left: '10%', right: '10%', top: '10%', height: '50%' },
          { left: '10%', right: '10%', top: '70%', height: '15%' }
        ],
        xAxis: [
          {
            type: 'category',
            data: dates,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: { z: 100 }
          },
          {
            type: 'category',
            gridIndex: 1,
            data: dates,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax'
          }
        ],
        yAxis: [
          {
            scale: true,
            splitArea: { show: true }
          },
          {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: { show: false },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false }
          }
        ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 0,
            end: 100
          },
          {
            show: true,
            xAxisIndex: [0, 1],
            type: 'slider',
            top: '90%',
            start: 0,
            end: 100
          }
        ],
        series: [
          {
            name: 'K线图',
            type: 'candlestick',
            data: klineData,
            itemStyle: {
              color: '#ec0000', // Red for up days
              color0: '#00da3c', // Green for down days
              borderColor: '#8a0000',
              borderColor0: '#008F28'
            },
            markPoint: { data: markers }
          },
          {
            name: '成交量',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: volumes,
            itemStyle: {
              color: '#5470C6'
            }
          }
        ]
      }

      // POWERLINE chart configuration with reference lines
      const powerlineOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const dataIndex = params[0].dataIndex
            const date = params[0].axisValue
            const value = params[0].data
            return `<div style="font-weight:bold">${date}</div>POWERLINE: ${value.toFixed(4)}`
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
          name: 'POWERLINE',
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
            symbolSize: 6,
            markLine: {
              silent: true,
              data: [
                { yAxis: 3.5, name: '清仓线', lineStyle: { color: '#FF0000' }, label: { position: 'end', formatter: '清仓线 3.5' } },
                { yAxis: 3.2, name: '超买线', lineStyle: { color: '#FF4500' }, label: { position: 'end', formatter: '超买线 3.2' } },
                { yAxis: 1.75, name: '强弱线', lineStyle: { color: '#FFD700' }, label: { position: 'end', formatter: '强弱线 1.75' } },
                { yAxis: 0.5, name: '超卖线', lineStyle: { color: '#32CD32' }, label: { position: 'end', formatter: '超卖线 0.5' } },
                { yAxis: 0.2, name: '底部线', lineStyle: { color: '#00CED1' }, label: { position: 'end', formatter: '底部线 0.2' } }
              ]
            }
          }
        ]
      }

      // XYS chart configuration (捕捞季节)
      const xysOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const dataIndex = params[0].dataIndex
            const date = params[0].axisValue
            let html = `<div style="font-weight:bold">${date}</div>`
            params.forEach(param => {
              html += `${param.seriesName}: ${param.data.toFixed(4)}<br>`
            })
            return html
          }
        },
        legend: {
          data: ['XYS1', 'XYS2'],
          top: '5%'
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '15%',
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
          name: '捕捞季节'
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
            name: 'XYS1',
            type: 'line',
            data: xys1,
            lineStyle: { color: '#32CD32' }, // Green
            symbol: 'triangle',
            symbolSize: 6
          },
          {
            name: 'XYS2',
            type: 'line',
            data: xys2,
            lineStyle: { color: '#FF4500' }, // OrangeRed
            symbol: 'diamond',
            symbolSize: 6
          }
        ]
      }

      // Portfolio chart configuration
      const portfolioOption = {
        animation: false,
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            const dataIndex = params[0].dataIndex
            const date = params[0].axisValue
            const value = params[0].data
            return `<div style="font-weight:bold">${date}</div>投资组合: ${value.toFixed(2)}`
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
          name: '投资组合价值',
          axisLine: { show: true },
          axisLabel: { show: true },
          min: 10000, // Zero axis base
          splitLine: { show: true }
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
            lineStyle: { color: '#8A2BE2' }, // Purple
            symbol: 'circle',
            symbolSize: 6
          }
        ]
      }

      try {
        this.klineChart.setOption(klineOption)
        this.powerlineChart.setOption(powerlineOption)
        this.xysChart.setOption(xysOption)
        this.portfolioChart.setOption(portfolioOption)
      } catch (e) {
        console.error('Failed to set chart options:', e)
        this.error = '图表渲染失败，请检查数据'
      }
    }
  }
}
</script>

<style scoped>
.stocks {
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

.kline-section, .powerline-section, .xys-section, .portfolio-section {
  width: 100%;
}

#kline-chart, #powerline-chart, #xys-chart, #portfolio-chart {
  width: 100%;
  height: 400px;
  min-height: 400px;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>