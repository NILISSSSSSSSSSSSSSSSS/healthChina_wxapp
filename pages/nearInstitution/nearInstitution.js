

const commonMethod = require("../../utils/common");
const modalWindow = require("../../utils/modalWindow");
const localStorage = require("../../utils/localStorage");
const Const = require("../../utils/const");
const config = require("../../utils/config");
const Address = require("../../utils/address");
const NC = require("../../utils/Notification.js");
const Notify = require("../../utils/notify.js");

const notOrgImg = commonMethod.iconUrl('imgUrl','org_img');

Page({
  data: {
		currentPosition:localStorage.getData('lastAdcode').provinceCity
    ,arriveBottom:false
    ,notMoreCont:false
    ,nearInstitutionDisabled:false
		,toMoreImg:commonMethod.iconUrl('iconUrl','icon_arrow_blue')
		,isLoading:true
  },

  private: {
    chooseGps:false,
    pageNum:1
  },

	readSetting:function (callback) {
		wx.getSetting({
			success: (res) => {
				console.log('getSetting',res);
				let openGps = res.errMsg.indexOf("ok") ? res.authSetting['scope.userLocation']:true;

				if ( !openGps ) {
					modalWindow.clickModal({
						content:"未开启地理位置"
						,showCancel:false
						,confirmText:"去开启"
					},function () {
						wx.openSetting({
							success: (res) => {
								console.log(res);
							},
							fail: (err) => {
								console.error(err);
							}
						});
					});
					callback(false);
					return;
				}

				callback(true);
			},
			fail:function(err){
				console.error('getSetting',err);
				modalWindow.clickModal({
					title:"获取设置失败"
					,content:"获取微信地理位置失败啦，请稍后重试。"
					,showCancel:false
				});
				callback(false);
			}
		});
	},

	nearInstitutionButton:function (e) {
		let event = e.detail.target.dataset.event;
		let index = e.detail.target.dataset.index;
		this.setData({nearInstitutionDisabled:true});
		if ( !e.detail.target.dataset.event ) event = 'nullFunction';
		this[event](index);
	},

	nullFunction: function () {
		this.setData({nearInstitutionDisabled:false});
	},

	chooseGps: function (index) {
    let that = this;
		that.readSetting(function (pass) {
			if (pass) {
				wx.chooseLocation({
					success: (res) => {
						console.log(res);
						that.private.chooseGps = true;
						if ( res.name ) {
							let provinceCity = res.address;
							if ( !res.address || res.address === '' ) {
								provinceCity = res.name;
							}
							localStorage.setData('nearOrgGps',{lng:res.longitude,lat:res.latitude,provinceCity:provinceCity});
							NC.postNotification(Notify.GpsChanged.name);
						} else {
							localStorage.setData('nearOrgGps',localStorage.getData('lastAdcode'));
						}
					}
					,fail: (err) => {
						if ( err.errMsg.indexOf('cancel') < 0 ) {
							console.error(err);
							modalWindow.clickModal({
								content:'选择位置失败啦！'
								,showCancel:false
							});
						}
					}
				});
			}
		});
	},

	nearInstitution: function (index) {
  	let nearInstitutionArr = this.data.nearInstitutionArr;
		wx.navigateTo({
			url: '../institutionDetail/institutionDetail?id='+nearInstitutionArr[index]._id
		});
	},

  onLoad: function (options) {
		NC.addObserver(this, 'OnGpsChanged', Notify.GpsChanged.name);
    if ( !this.private.chooseGps ) {
			let lastAdcode = localStorage.getData('lastAdcode');
			localStorage.setData('nearOrgGps',lastAdcode);
    }
    this.piepline();
  },

	OnGpsChanged: function () {
		this.piepline();
	},

  onShow: function () {
		this.setData({nearInstitutionDisabled:false});
  },

	piepline: function () {
		let that = this;
		let nearOrgGps = localStorage.getData('nearOrgGps');
		let gps = {lng:nearOrgGps.lng,lat:nearOrgGps.lat};
		that.setData({
			arriveBottom:false,
			notMoreCont:false,
			nearInstitutionDisabled:false,
			currentPosition:nearOrgGps.provinceCity
		});
		that.dealNearInstitutionRequest(gps,1)
			.then(res => {
				that.setData({
					nearInstitutionArr:res
					,isLoading:false
				});
				wx.hideLoading();
			})
			.catch(err => {
				modalWindow.clickModal({
					content:'获取附近机构失败啦！请稍后重试。'
					,showCancel:false
				});
			});
	},

  dealNearInstitutionRequest: function (gps,page) {
    console.warn(gps);
    let that = this;
    return new Promise((resolve,reject) => {
      let url = config.nearInstitutionUrl+'contract/near-hospital?lng='+gps.lng+'&lat='+gps.lat+'&page='+page;
      getApp().urlRequest(url,'GET',{},function (res) {
        console.log(res);
        if ( res.status_code !== Const.Code.NearSuc ) {
          reject(res);
          return;
        }

        let requestData = [];
        if ( res.data.data.length === 0 ) {
          resolve(requestData);
          return;
        }

        for (let i = 0;i < res.data.data.length; i++ ) {
          let praise_count = res.data.data[i].praise_count ? res.data.data[i].praise_count:0;
          let leftImg = 'https:'+res.data.data[i].organ_image;
          if ( !res.data.data[i].organ_image ) {
						leftImg = notOrgImg;
					}
					requestData.push({
						img:leftImg
            ,title:res.data.data[i].name || ''
            ,distance:res.data.data[i].distance || '未知'
            ,zanNum:res.data.data[i].praise_count || 0
            ,_id:res.data.data[i]._id
          });
        }
				that.private.pageNum = page + 1;
        resolve(requestData);
			},function (err) {
        console.error(err);
				reject(err);
			});
    });
	},

  onReachBottom: function () {
    let that = this;
    let nearOrgGps = localStorage.getData('nearOrgGps');
		let gps = {lng:nearOrgGps.lng,lat:nearOrgGps.lat};
    that.setData({arriveBottom:true,notMoreCont:false});
    that.dealNearInstitutionRequest(gps,that.private.pageNum)
      .then(res => {
				that.setData({
					arriveBottom:false,
					nearInstitutionArr:that.data.nearInstitutionArr.concat(res)
				});

				if ( res.length === 0 ) {
					that.setData({
						notMoreCont:true
					});
        }
      })
      .catch(err => {
				modalWindow.clickModal({
					content:'获取附近机构失败啦！请稍后重试。'
					,showCancel:false
				});
      });
  }
});