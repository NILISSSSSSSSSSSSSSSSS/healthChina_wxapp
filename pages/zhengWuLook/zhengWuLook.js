

const commonMethod = require("../../utils/common");
const modalWindow = require("../../utils/modalWindow");
const localStorage = require("../../utils/localStorage");
const Const = require("../../utils/const");
const config = require("../../utils/config");

const moreImgObj = {
	true:commonMethod.iconUrl('iconUrl','dtriangle')
	,false:commonMethod.iconUrl('iconUrl','xtriangle')
};

Page({
  data: {
    type:''
    ,newButtonDisabled:false
		,currentPageIndex:1
		,isLoading:true
  },

  private: {
    type:''
    ,adCodeObj:{}
    ,height:''
  },

	returnLookDetail: function () {
		let type = this.private.type;
		let map = new  Map([
			['assistedOrg',{
				api:'api/home/AssistedReproduction'
				,title:'辅助生殖机构'
        ,method:'dealAssistedReproductiveOrgResult'
			}]
			,['transplantOrg',{
				api:'api/home/OrganTransplant'
				,title:'器官移植机构'
				,method:'dealOrganTransplantationOrgResult'
			}]
			,['medicinesList',{
				api:'api/home/DrugDirectory'
				,title:'基本药物目录'
				,method:'dealMedicinesListResult'
			}]
		]);

		if ( map.has(type) ) {
			return map.get(type);
		}

		return {}
	},

	onLoad: function (options) {
		console.log(options.type);
		if (!options.type ) return;

		let that = this;
		that.private.type = options.type;
		that.setData({
			type:options.type
	  });
		commonMethod.setNavigationTitle(that.returnLookDetail().title);
		that.getOrgTreeNodes()
      .then(adCodeArr => {
				that.private.adCodeObj = that.changeAdCodeToObj(adCodeArr);
				that.queryApi()
					.then(res => {
						console.log(res);
						let lookListArr = {};
						do {
							if ( !res.items ) {
								lookListArr = {items:[]};
								break;
							}

							lookListArr = that[that.returnLookDetail().method](res);
						}while (false);
						that.setData({
							lookListArr:lookListArr
							,isLoading:false
						});
					})
					.catch(err => {
						console.error(err);
						modalWindow.clickModal({
							content:'获取详情失败，请稍后重试！'
							,mask:config.mask
							,showCancel:false
						});
					});
      })
      .catch(err => {
        console.error(err);
				modalWindow.clickModal({
					content:'获取省份列表失败'
					,mask:config.mask
					,showCancel:false
				});
      });
	},

	submitButton: function (e) {
		let event = e.detail.target.dataset.event;
		let index = e.detail.target.dataset.index;
		this.setData({newButtonDisabled:true});
		if ( !e.detail.target.dataset.event ) event = 'nullFunction';
		this[event](e,index,event);
	},

	nullFunction: function () {
		this.setData({newButtonDisabled:false});
	},

	moreLess: function (e,index) {
		let that = this;
		let lookListArr = this.data.lookListArr;
		lookListArr.items[index].imageUrl = moreImgObj[!lookListArr.items[index].isShow];
		lookListArr.items[index].isShow = !lookListArr.items[index].isShow;
		this.setData({
			newButtonDisabled:false
			,lookListArr:lookListArr
		});
	},

	getOrgTreeNodes: function (adcode = '86') {
		return new Promise((resolve,reject) => {
			getApp().shortRequest('api/GetOrgTreeNodes',{adcode:adcode},function (res) {
				res.api = 'GetOrgTreeNodes';
				if ( res.code !== Const.Code.NewSuc ) {
					reject(res);
					return;
				}

				resolve(res.items);
			},function (err) {
				err.api = 'GovernmentAffairsSearch';
				reject(err);
			});
		});
	},

	changeAdCodeToObj: function (adCodeArr) {
		let obj = {};
		for ( let i = 0;i<adCodeArr.length;i++ ) {
			obj['86'] = '全国';
			obj[adCodeArr[i].adcode] = adCodeArr[i].name;
		}
		return obj;
	},

	queryApi: function (data = {}) {
		let that = this;
		return new Promise((resolve,reject) => {
		  let api = that.returnLookDetail().api;
			getApp().shortRequest(api,data,function (res) {
				res.api = api;
				if ( res.code !== Const.Code.NewSuc ) {
					reject(res);
					return;
				}

				resolve(res);
			},function (err) {
				err.api = api;
				reject(err);
			});
		});
	},

	getCityName: function (adcode) {
		return this.private.adCodeObj[adcode] ? this.private.adCodeObj[adcode]:'未知城市';
	},

	dealAssistedReproductiveOrgResult: function (res) {
		let releaseTimeObj = commonMethod.formatDate(res.publishTime);
		let asOfTimeObj = commonMethod.formatDate(res.endAt);
		res.tip = `一、${res.tip}`;
		res.releaseTime = `发布时间: ${releaseTimeObj.year}-${releaseTimeObj.month}-${releaseTimeObj.date}`;
		res.asOfTime = `(截至${asOfTimeObj.year}年${asOfTimeObj.month}月${asOfTimeObj.date}日)`;
		for ( let i = 0;i<res.items.length;i++ ) {
			res.items[i].isShow = true;
			res.items[i].imageUrl = moreImgObj['true'];
		}
		return res;
	},

	dealOrganTransplantationOrgResult: function (res) {
		let releaseTimeObj = commonMethod.formatDate(res.publishTime);
		res.releaseTime = `发布时间: ${releaseTimeObj.year}-${releaseTimeObj.month}-${releaseTimeObj.date}`;
		for ( let i = 0;i<res.items.length;i++ ) {
			res.items[i].isShow = true;
			res.items[i].imageUrl = moreImgObj['true'];
		}
		return res;
	},

	dealMedicinesListResult: function (res) {
    return res.items;
	},

	onShow: function () {
    this.setData({newButtonDisabled:false});
  },

	onReady: function () {
  	let that = this;
		if ( this.private.type === 'medicinesList' && !that.private.height ) {
			setTimeout(() => {
				let selectorQueryInfo = wx.createSelectorQuery().in(that);
				selectorQueryInfo.select('.medicinesListTemplate').boundingClientRect(function(res){
					that.private.height = 500;
					if ( !res || !res.height ) return;

					that.private.height = res.height;
					console.log(that.private.height);
				}).exec();
			},500);
		}
	},

	bindScrollTolower: function () {
		let that = this;
		if (  this.private.type === 'medicinesList') {
			that.setData({
				currentPageIndex:that.data.lookListArr.length
			});
		}
	},

	bindScroll: function (e) {
  	let that = this;
  	if (  this.private.type === 'medicinesList') {
  		let currentPageIndex = Math.ceil(e.detail.scrollTop/that.private.height);
  		if ( currentPageIndex >= that.data.lookListArr.length ) {
				currentPageIndex = that.data.lookListArr.length;
			}
			if ( currentPageIndex <= 1 ) {
				currentPageIndex = 1;
			}
			that.setData({
				currentPageIndex:currentPageIndex
			});
		}
	}
});