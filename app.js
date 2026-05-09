App({
  onLaunch() {
    // 初始化打卡记录
    if (!wx.getStorageSync('checkinRecords')) {
      wx.setStorageSync('checkinRecords', [])
    }
  },

  globalData: {
    // 腾讯位置服务API配置
    qqMapKey: 'HXBZ-LJZ6Q-YVP5G-4IX36-5QR36-N4BYG', // 腾讯位置服务Key
    // 打卡类型
    checkinTypes: ['上班', '下班', '外出', '返回']
  }
})
