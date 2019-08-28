

const commonMethod = require("../../utils/common");
const localStorage = require("../../utils/localStorage");
const NC = require("../../utils/Notification.js");
const Notify = require("../../utils/notify.js");
const modalWindow = require("../../utils/modalWindow");
const config = require("../../utils/config");
const Const = require("../../utils/const");

Page({
  data: {
		searchSubmitDisabled:false
    ,historyRecordArr:[]
    ,hotSearchArr:[]
		,searchValue:''
		,isLoading:true
  },

  private: {
		from:0
  },

  onLoad: function (options) {
    let that = this;
    that.getHotSearch()
			.then(res => {
				that.setData({
					hotSearchArr:res
					,isLoading:false
				});
			})
			.catch(err => {
				console.error(err);
				modalWindow.clickModal({
					content:'获取热门搜索失败，请稍后重试。'
					,mask:config.mask
					,showCancel:false
				});
			});
    if ( options.from ) {
      that.private.from = options.from;  // 1 index ; 2 kePu
    }
  },

	getHotSearch: function () {
		let that = this;
		return new Promise((resolve,reject) => {
			getApp().shortRequest('api/home/HotSearch',{},function (res) {
				res.api = 'HotSearch';
				if ( res.code !== Const.Code.NewSuc ) {
					reject(res);
					return;
				}

				let hotSearchArr = [];
				for ( let i = 0;i<res.items.length;i++ ) {
					hotSearchArr.push({text:res.items[i]});
				}
				resolve(hotSearchArr);
			},function (err) {
				err.api = 'HotSearch';
				reject(err);
			});
		});
	},

	sendNotification: function (value) {
		localStorage.setData('recommendedScience',2);
		localStorage.setData('searchValue',commonMethod.deleteSpace(value));
		NC.postNotification(Notify.SearchChanged.name);
		if ( parseInt(this.private.from) === 1 ) {
			wx.switchTab({
				url: '../science/science'
			});
			return;
		}

		wx.navigateBack({
			delta: 1
		});
	},

	setHistoryRecordArr: function (value) {
		let historyRecordArr = localStorage.exists('historyRecordArr') ? localStorage.getData('historyRecordArr') : [];
		do {
			if ( historyRecordArr.length === 0 ) {
				historyRecordArr.unshift({text:commonMethod.deleteSpace(value)});
				break;
			}

			let boolean = false;
			for ( let i = 0;i<historyRecordArr.length;i++ ) {
				if ( commonMethod.deleteSpace(value) === historyRecordArr[i].text ) {
					boolean = true;
				}
			}
			if ( !boolean ) {
				historyRecordArr.unshift({text:commonMethod.deleteSpace(value)});
			}
		}while (false);
		let lastArr = historyRecordArr;
		if ( historyRecordArr.length >= 6 ) {
			lastArr = historyRecordArr.slice(0,5);
		}
		localStorage.setData('historyRecordArr',lastArr);
	},

	bindConfirm: function (e) {
  	this.setHistoryRecordArr(e.detail.value);
  	this.sendNotification(e.detail.value);
	},

	searchSubmit:function (e) {
		let event = e.detail.target.dataset.event;
		let index = e.detail.target.dataset.index;
		this.setData({searchSubmitDisabled:true});
		if ( !e.detail.target.dataset.event ) event = 'nullFunction';
		this[event](index,event);
	},

	nullFunction: function () {
		this.setData({newButtonDisabled:false});
	},

	bindInput: function (e) {
		this.setData({
			searchValue:commonMethod.deleteSpace(e.detail.value)
		});
	},

	deleteSearchValue: function () {
		localStorage.setData('recommendedScience',1);
		localStorage.remove(['searchValue']);
		this.setData({newButtonDisabled:false,searchValue:''});
	},

	cancel: function () {
  	localStorage.setData('recommendedScience',1);
  	localStorage.remove(['searchValue']);
		wx.navigateBack({
			delta: 1
		});
	},

	removeRecord: function () {
    localStorage.remove(['historyRecordArr']);
    this.setData({
			historyRecordArr:[]
			,searchSubmitDisabled:false
		});
	},

	historyRecord: function (index) {
		this.sendNotification(this.data.historyRecordArr[index].text);
	},

	hotSearch: function (index) {
		this.setHistoryRecordArr(this.data.hotSearchArr[index].text);
		this.sendNotification(this.data.hotSearchArr[index].text);
	},

	onShow: function () {
		let historyRecordArr = localStorage.exists('historyRecordArr') ? localStorage.getData('historyRecordArr') : [];
		this.setData({
			historyRecordArr:historyRecordArr
			,searchSubmitDisabled:false
		});
    if ( localStorage.exists('searchValue') ) {
    	this.setData({searchValue:localStorage.getData('searchValue')});
		}
  }
});