// pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeNames: ['1'],
  },

  onChange(event) {
    this.setData({
      activeNames: event.detail
    });
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //var disease_id = options.id;
    //console.log(disease_id);
    this.setData({
      disease_id : options.id
    })

    var that = this;
    var disease_id = options.id;
    wx.cloud.init(),
      wx.cloud.callFunction({
        name: 'API',
        data: {
          DISEASE: disease_id
        },
        success(res) {
          that.setData({
            list: res.result.DISEASE_INFO[0]
          })
        },
        fail: console.error
      })


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})