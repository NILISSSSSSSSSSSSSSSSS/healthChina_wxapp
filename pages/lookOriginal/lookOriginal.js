

const commonMethod = require("../../utils/common");
const modalWindow = require("../../utils/modalWindow");
const localStorage = require("../../utils/localStorage");
const Const = require("../../utils/const");
const config = require("../../utils/config");

const dataFormType = {
	describe:'allText'
	,diseaseText:'bingText'
	,diseaseImg:'bingImgText'
	,doctor:'bingDoctor'
	,hospitalText:'hospitalText'
	,hospitalImg:'hospitalImg'
};

const dataFormEvent = {
	describe:'dealAllTextRequest'
	,diseaseText:'dealAllTextRequest'
	,diseaseImg:'dealAllTextRequest'
	,doctor:'dealAllTextRequest'
	,hospitalText:'dealAllTextRequest'
	,hospitalImg:'dealAllTextRequest'
};

const notHeadImg = commonMethod.iconUrl('iconUrl','defualthead');

Page({
	data: {
		scienceDetailsDisabled:false,
		scienceDetail:{},
		haveMoreStyle:false
	},

	dealAllTextRequest: function (scienceInfo,keyword) {
		return new Promise((resolve,reject) => {
			getApp().shortRequest('diseaseInfo',{id:scienceInfo._id,keyword:keyword},function (res) {
				console.log(res);
				if ( res.code !== Const.Code.SUC ) {
					reject(res);
					return;
				}

				let requestData = res.msg;
				let textArr = [];
				let contents = res.msg.contents;
				for ( let i = 0; i < contents.length; i++ ) {
					if ( contents[i].list && contents[i].list.length > 0 ) {
						textArr.push({content:contents[i].name,type:'sub_title'});
						textArr = textArr.concat(contents[i].list);
					}
				}

				requestData['textArr'] = textArr;
				requestData['write'] = res.msg['write_doctor_list'] || [];
				requestData['audit'] = res.msg['check_doctor_list'] || [];
				resolve(requestData);
			},function (err) {
				reject(err);
			});
		});
	},

	dealScienceDetailTitle: function (scienceInfo,requestData) {
		return new Promise((resolve,reject) => {
			this[scienceInfo.type](scienceInfo,requestData)
				.then(res => resolve(res))
				.catch(err => reject(err));
		});
	},

	describe: function (scienceInfo,requestData) {
		return new Promise((resolve,reject) => {
			resolve(requestData.name);
		});
	},

	diseaseText: function (scienceInfo,requestData) {
		return new Promise((resolve,reject) => {
			resolve(requestData.name);
		});
	},

	diseaseImg: function (scienceInfo,requestData) {
		return new Promise((resolve,reject) => {
			resolve(requestData.name);
		});
	},

	doctor: function (scienceInfo,requestData) {
		return new Promise((resolve,reject) => {
			resolve(requestData.doctor.name);
		});
	},

	hospitalText: function (scienceInfo,requestData) {
		return new Promise((resolve,reject) => {
			resolve(requestData.name);
		});
	},

	hospitalImg: function (scienceInfo,requestData) {
		return new Promise((resolve,reject) => {
			resolve(requestData.name);
		});
	},

	onLoad: function () {
		wx.showLoading({
			title:'加载中...'
			,mask:config.mask
		});
		let that = this;
		this.setData({scienceDetailsDisabled:false});
		this.scienceInfo = localStorage.getData('scienceInfo');
		that[dataFormEvent[that.scienceInfo.type]](that.scienceInfo,'')
			.then(res => {
				console.log(res);
				res['dataType'] = dataFormType[this.scienceInfo.type];
				that.setData({scienceDetail:res});
				return that.dealScienceDetailTitle(this.scienceInfo,res);
			})
			.then(data => {
				wx.setNavigationBarTitle({
					title: data
				});
				wx.hideLoading();
			})
			.catch(err => {
				console.log(err);
				modalWindow.clickModal({
					content:'获取科普详情失败，请稍后重试。'
					,showCancel:false
				});
			});
	},

  onHide: function () {
  
  },

  onUnload: function () {
  
  }
});