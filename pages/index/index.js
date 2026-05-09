// pages/index/index.js
const app = getApp()

Page({
  data: {
    currentTime: '',
    currentDate: '',
    checkinType: '上班',
    latitude: null,
    longitude: null,
    locationAddress: '',
    remark: '',
    records: [],
    todayCount: 0,
    weekCount: 0,
    canCheckin: false
  },

  onLoad() {
    this.updateTime()
    this.loadRecords()
    
    // 每秒更新时间
    this.timer = setInterval(() => {
      this.updateTime()
    }, 1000)
    
    // 获取位置
    this.getLocation()
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  onShow() {
    this.loadRecords()
  },

  // 更新时间显示
  updateTime() {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekDay = weekDays[now.getDay()]
    
    this.setData({
      currentTime: `${hours}:${minutes}:${seconds}`,
      currentDate: `${year}-${month}-${day} ${weekDay}`
    })
  },

  // 选择打卡类型
  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      checkinType: type
    })
  },

  // 获取位置
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude.toFixed(6),
          longitude: res.longitude.toFixed(6),
          canCheckin: true
        })
        
        // 解析地址
        this.reverseGeocoder(res.latitude, res.longitude)
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        this.setData({
          locationAddress: '请允许定位权限',
          canCheckin: false
        })
        
        wx.showModal({
          title: '定位失败',
          content: '请在设置中允许获取位置信息',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              wx.openSetting()
            }
          }
        })
      }
    })
  },

  // 逆地址解析
  reverseGeocoder(latitude, longitude) {
    const key = app.globalData.qqMapKey
    
    if (!key) {
      this.setData({
        locationAddress: `纬度: ${latitude.toFixed(6)}, 经度: ${longitude.toFixed(6)}`
      })
      return
    }
    
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: {
        location: `${latitude},${longitude}`,
        key: key,
        get_poi: 1
      },
      success: (res) => {
        if (res.data.status === 0) {
          const address = res.data.result.address
          const recommend = res.data.result.formatted_addresses
          this.setData({
            locationAddress: recommend ? recommend.recommend : address
          })
        }
      },
      fail: () => {
        this.setData({
          locationAddress: `纬度: ${latitude.toFixed(6)}, 经度: ${longitude.toFixed(6)}`
        })
      }
    })
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  // 执行打卡
  doCheckin() {
    if (!this.data.canCheckin) {
      wx.showToast({
        title: '请先获取位置',
        icon: 'none'
      })
      return
    }

    const now = new Date()
    const record = {
      id: Date.now(),
      type: this.data.checkinType,
      time: this.formatTime(now),
      timestamp: now.getTime(),
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      address: this.data.locationAddress,
      remark: this.data.remark
    }

    // 保存到本地存储
    const records = wx.getStorageSync('checkinRecords') || []
    records.unshift(record) // 新记录添加到开头
    wx.setStorageSync('checkinRecords', records)

    // 更新页面数据
    this.setData({
      remark: '',
      records: records.slice(0, 50) // 只显示最近50条
    })
    
    this.calculateStats()

    wx.showToast({
      title: '打卡成功',
      icon: 'success'
    })

    // 振动反馈
    wx.vibrateShort({
      type: 'medium'
    })
  },

  // 格式化时间
  formatTime(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  },

  // 加载打卡记录
  loadRecords() {
    const records = wx.getStorageSync('checkinRecords') || []
    this.setData({
      records: records.slice(0, 50)
    })
    this.calculateStats()
  },

  // 计算统计数据
  calculateStats() {
    const records = this.data.records
    const now = new Date()
    
    // 今日记录数
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const todayCount = records.filter(r => r.time.startsWith(todayStr)).length
    
    // 本周记录数
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekCount = records.filter(r => r.timestamp >= weekStart.getTime()).length
    
    this.setData({
      todayCount,
      weekCount
    })
  },

  // 删除单条记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条打卡记录吗？',
      success: (res) => {
        if (res.confirm) {
          let records = wx.getStorageSync('checkinRecords') || []
          records = records.filter(r => r.id !== id)
          wx.setStorageSync('checkinRecords', records)
          
          this.setData({
            records: records.slice(0, 50)
          })
          this.calculateStats()
          
          wx.showToast({
            title: '已删除',
            icon: 'success'
          })
        }
      }
    })
  },

  // 清空所有记录
  clearRecords() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有打卡记录吗？此操作不可恢复。',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('checkinRecords', [])
          this.setData({
            records: [],
            todayCount: 0,
            weekCount: 0
          })
          
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  // 导出记录
  exportRecords() {
    const records = this.data.records
    
    if (records.length === 0) {
      wx.showToast({
        title: '暂无记录可导出',
        icon: 'none'
      })
      return
    }

    // 生成CSV内容
    let csv = '打卡类型,时间,地址,备注,纬度,经度\n'
    records.forEach(r => {
      csv += `${r.type},${r.time},"${r.address}",${r.remark || ''},${r.latitude},${r.longitude}\n`
    })

    // 复制到剪贴板
    wx.setClipboardData({
      data: csv,
      success: () => {
        wx.showModal({
          title: '导出成功',
          content: '打卡记录已复制到剪贴板，可以粘贴到Excel或文本编辑器保存。',
          showCancel: false
        })
      }
    })
  }
})
