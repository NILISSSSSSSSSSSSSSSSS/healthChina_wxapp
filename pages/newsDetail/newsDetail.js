

const commonMethod = require("../../utils/common");
const modalWindow = require("../../utils/modalWindow");
const localStorage = require("../../utils/localStorage");
const Const = require("../../utils/const");
const config = require("../../utils/config");

const clickZanImgObj = {
  true:commonMethod.iconUrl('iconUrl','icon_zan')
  ,false:commonMethod.iconUrl('iconUrl','icon_notZan')
};

const playAudioImgObj = {
	true:commonMethod.iconUrl('iconUrl','icon_start')
	,false:commonMethod.iconUrl('iconUrl','icon_suspended')
};

Page({
  data: {
		clickZanImg:clickZanImgObj['false'],
		newsInfo:{audioUrl:''}
		,audioPlayImg:playAudioImgObj[false]
    ,sliderTime:'00:00:00'
    ,sliderDisabled:true
		,canClickZan:1
		,audioTime:''
		,sliderMax:400
		,clickZanSuccess:false
		,isLoading:true
  },

	private: {
		canClickZan:1,
		newsId:'',
		updateInterval:null,
		pageHide:false
	},

	newsDetailButton: function (e) {
		let event = e.detail.target.dataset.event;
		if ( !e.detail.target.dataset.event ) event = 'nullFunction';
		this[event]();
	},

	nullFunction: function () {

	},

	clickZan: function () {
  	let that = this;
    if ( that.data.clickZanImg.indexOf('icon_zan') >= 0 ) return;

    getApp().shortRequest('dig',{id:localStorage.getData('news_id')},function (res) {
			console.log(res);
			if ( res.code !== Const.Code.SUC ) {
				modalWindow.clickModal({
					content:'点赞失败啦！请稍后重试。'
					,showCancel:false
				});
				return;
			}

			that.newsInfoLocal[that.news_id].zanNum++;
			that.newsInfoLocal[that.news_id].clickZan = true;
			localStorage.setData('newsInfo',that.newsInfoLocal);
			that.setData({
				clickZanImg:clickZanImgObj['true'],
				clickZanSuccess:true
			});
			setTimeout(() => {
				let hideZanSucAnimation = wx.createAnimation({
					duration: 1000,
					timingFunction: 'ease',
				});
				hideZanSucAnimation.opacity(0).step();
				that.setData({
					hideZanSucAnimation:hideZanSucAnimation.export()
				});
			},1500);
		},function (err) {
			console.error(err);
			modalWindow.clickModal({
				content:'点赞失败啦！请稍后重试。'
				,showCancel:false
			});
		});
	},

	controlAudio: function () {
    let dataUrl = this.data.newsInfo.audioUrl;
    let event = 'playAudio';
    if ( this.data.audioPlayImg.indexOf('icon_start') >= 0 ) {
			event = 'suspendedAudio';
    }
    this[event](dataUrl);
	},

	seek: function (e) {
		this.removeInterval();
		let that = this;
		wx.seekBackgroundAudio({
			position: e.detail.value,
			complete: function () {
				// 实际会延迟两秒左右才跳过去
				setTimeout(() => {
					that._enableInterval()
				}, 2000);
			}
		})
	},

  playAudio: function (dataUrl) {
		let that = this;
		wx.playBackgroundAudio({
			dataUrl: dataUrl,
			success: function (res) {
				that.setData({
					audioPlayImg: playAudioImgObj[true],
					sliderDisabled:false
				});
			}
		});
		this._enableInterval();
	},

	suspendedAudio:function (dataUrl) {
		let that = this;
		that.removeInterval();
		wx.pauseBackgroundAudio({
			dataUrl: dataUrl,
			success: function () {
				that.setData({
					audioPlayImg: playAudioImgObj[false],
					sliderDisabled:true
				});
			}
		});
	},

	stopAudio: function () {
		let that = this;
		let dataUrl = this.data.newsInfo.audioUrl;
		wx.stopBackgroundAudio({
			dataUrl: dataUrl,
			success: function (res) {
				that.setData({
					audioPlayImg: playAudioImgObj[false],
					playTime: 0,
					sliderTime: commonMethod.playTime(0)
				})
			}
		});
	},

	getHMS: function (duration) {
  	let hours,minute,second;
		hours = duration >= 3600 ? (parseInt(duration/3600) >= 10 ? parseInt(duration/3600) : '0'+parseInt(duration/3600))  : '00';
		minute = parseInt((duration%3600)/60) >= 10 ? parseInt((duration%3600)/60) : '0'+parseInt((duration%3600)/60);
		second = ((duration%3600)%60) >= 10 ? ((duration%3600)%60) : '0'+ ((duration%3600)%60);
		return hours+':'+minute+':'+second;
	},

	_enableInterval: function () {
		let that = this;
		update();
		this.private.updateInterval = setInterval(update, 500);
		function update() {
			wx.getBackgroundAudioPlayerState({
				success: function (res) {
				  // console.log(res);
				  if ( parseInt(res.status) === 2 ) {
						that.setData({
							playTime: that.data.sliderMax,
							sliderTime: commonMethod.playTime(that.data.sliderMax),
							sliderDisabled:true,
							audioPlayImg:playAudioImgObj[false]
						});
						console.warn(that.private.pageHide);
						if ( that.private.pageHide ) {
							that.removeInterval();
						}
				  	return;
					}

					if ( parseInt(res.status) === 0 ) {
						that.removeInterval();
						return;
					}

					if ( parseInt(res.status) === 1 && that.data.audioPlayImg.indexOf('icon_suspended')) {
						that.setData({
							audioPlayImg:playAudioImgObj[true]
						});
					}
				  if ( that.data.sliderMax !== res.duration ) {
				  	that.setData({
							sliderMax:res.duration,
							audioTime:commonMethod.playTime(res.duration)
						});
					}
					if ( res.currentPosition !== res.duration ) {
						that.setData({
							playTime: res.currentPosition,
							sliderTime: commonMethod.playTime(res.currentPosition + 1)
						});
					}
				}
			})
		}
	},

  onLoad: function (options) {
		this.private.canClickZan = parseInt(options.canClickZan);
		this.private.newsId = options.newsId;
  },

  onShow: function () {
  	let that = this;
    this.newsInfoLocal = localStorage.getData('newsInfo');
    this.news_id = localStorage.getData('news_id');
    this.dealNewsRequestData();
		that.private.pageHide = false;

		wx.onBackgroundAudioStop(function () {
			that.removeInterval();
			that.setData({
				playTime: that.data.sliderMax,
				sliderTime: commonMethod.playTime(that.data.sliderMax),
				sliderDisabled:true,
				audioPlayImg:playAudioImgObj[false]
			});
		});

		wx.onBackgroundAudioPause(function () {
			that.removeInterval();
			that.setData({
				sliderDisabled:true,
				audioPlayImg:playAudioImgObj[false]
			});
		});

		wx.onBackgroundAudioPlay(function () {
			that.setData({
				sliderDisabled:false,
				audioPlayImg:playAudioImgObj[true]
			});
		});
  },

  dealNewsRequestData: function () {
  	let that = this;
  	return new Promise((resolve,reject) => {
			getApp().shortRequest('articleInfo',{id:localStorage.getData('news_id')},function (res) {
				console.log(res);
				if ( res.code !== Const.Code.SUC ) {
					modalWindow.clickModal({
						content:'获取资讯详情失败，请稍后重试。'
						,showCancel:false
					});
					reject(res);
					return;
				}

				let publish_date = commonMethod.formatDate(res.data.publish_date);
				let requestData = {
					title:res.data.title,
					doctorInfo:{name:'',headImg:'',position:'',address:''},
					institutions:{
						img:res.data.author_logo,
						name:res.data.author,
						time:publish_date.year+'-'+publish_date.month+'-'+publish_date.date+'  '+publish_date.hour+':'+publish_date.minute,
					},
					describeImg:res.data.article_thumb,
					content:res.data.content,
					audioUrl:res.data.article_audio || ''
				};
				let clickZanImg = clickZanImgObj['true'];
				if( that.newsInfoLocal[that.news_id] ) {
					clickZanImg = clickZanImgObj[that.newsInfoLocal[that.news_id].clickZan];
				}
				if ( that.private.canClickZan === 2 ) {
					that.setData({
						canClickZan:2
					});
				} else {
					that.setData({
						canClickZan:1
					});
				}
				that.setData({
					newsInfo:requestData
					,clickZanImg:clickZanImg
					,scienceDetail:{textArr:requestData.content}
					,isLoading:false
				});
				wx.hideLoading();
			},function (err) {
				console.error(err);
				modalWindow.clickModal({
					content:'获取资讯详情失败，请稍后重试。'
					,showCancel:false
				});
				reject(err);
			});
		});
	},

	removeInterval: function () {
		clearInterval(this.private.updateInterval);
		this.private.updateInterval = null;
	},

  onHide: function () {
		this.private.pageHide = true;
		this.removeInterval();
		this.stopAudio();
  },

  onUnload: function () {
		this.private.pageHide = true;
		this.removeInterval();
		this.stopAudio();
	}
});