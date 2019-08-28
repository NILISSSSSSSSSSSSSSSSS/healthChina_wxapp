

const commonMethod = require("../../utils/common");
const modalWindow = require("../../utils/modalWindow");
const localStorage = require("../../utils/localStorage");
const Const = require("../../utils/const");
const Address = require("../../utils/address");
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
	,diseaseText:'bingText'
	,diseaseImg:'bingImgText'
	,doctor:'dealDoctorRequest'
	,hospitalText:'dealHospitalRequest'
	,hospitalImg:'dealHospitalRequest'
};

const notHeadImg = commonMethod.iconUrl('iconUrl','icon_no_head_team');

Page({
  data: {
		scienceDetailsDisabled:false,
		scienceDetail:{},
		haveMoreStyle:true
		,isLoading:true
  },

	serviceDetailButton: function (e) {
		let event = e.detail.target.dataset.event;
		let id = e.detail.target.dataset.id;
		if ( !e.detail.target.dataset.event ) event = 'nullFunction';
		this[event](id);
	},

	nullFunction: function () {
	},

	takePhone: function (id) {
  	if (id.length > 18 ) return;

		commonMethod.takePhone(id);
	},

	lookOriginal: function (id) {
  	this.setData({scienceDetailsDisabled:true});
		wx.navigateTo({
			url: '../lookOriginal/lookOriginal?id='+id
		});
	},

	mapNavigation: function (id) {
		commonMethod.mapNavigation(id);
	},

  onLoad: function (options) {
		let that = this;
		this.setData({scienceDetailsDisabled:false});
		this.scienceInfo = localStorage.getData('scienceInfo');
		that[dataFormEvent[that.scienceInfo.type]](that.scienceInfo,localStorage.getData('searchKey'))
			.then(res => {
				console.log(res);
				res['dataType'] = dataFormType[this.scienceInfo.type];
				that.setData({scienceDetail:res,isLoading:false});
				return that.dealScienceDetailTitle(this.scienceInfo,res);
			})
			.then(data => {
				wx.setNavigationBarTitle({
					title: data
				});
			})
			.catch(err => {
				console.log(err);
				modalWindow.clickModal({
					content:'获取科普详情失败，请稍后重试。'
					,showCancel:false
				});
			});
  },

	onShow: function () {
		this.setData({scienceDetailsDisabled:false});
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
						textArr.push({content:contents[i].name,type:'one_title'});
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

	dealDoctorRequest: function (scienceInfo,keyword) {
		return new Promise((resolve,reject) => {
			getApp().shortRequest('doctorInfo',{doc_id:scienceInfo._id},function (res) {
				console.log(res);
				if ( res.code !== Const.Code.SUC ) {
					reject(res);
					return;
				}

				let requestData = {};
				let doctorObj = {};
				requestData._id = res.msg._id;
				doctorObj.name = res.msg.doctor_name;
				doctorObj.good = res.msg.doctor_good_at;
				doctorObj.home = res.msg.doctor_office;
				doctorObj.position = res.msg.doctor_hospital;
				doctorObj.job = res.msg.doctor_rank;
				doctorObj.url = res.msg.doctor_avatar || notHeadImg;
				let textArr = [];
				textArr.push({content:res.msg.doctor_desc || ''});
				requestData['doctor'] = doctorObj;
				requestData['textArr'] = textArr;
				requestData['write'] = res.msg['write_doctor_list'] || [];
				requestData['audit'] = res.msg['check_doctor_list'] || [];
				resolve(requestData);
			},function (err) {
				reject(err);
			});
		});
	},

	dealHospitalRequest: function (scienceInfo,keyword) {
		return new Promise((resolve,reject) => {
			getApp().shortRequest('hospitalInfo',{hid:scienceInfo._id},function (res) {
				console.log(res);
				if ( res.code !== Const.Code.SUC ) {
					reject(res);
					return;
				}

				let requestData = {};
				requestData._id = res.msg._id;
				requestData.address = res.msg.address;
				requestData.telephone = res.msg.phone;
				requestData.name = res.msg.name;
				requestData.topImg = res.msg.pic || '';
				requestData.url = res.msg.url;
				requestData.route = res.msg.route || '';
				requestData.lng = res.msg.lng || null;
				requestData.lat = res.msg.lat || null;
				requestData.telephoneNumber = res.msg.phone.replace(/[^0-9]/ig,"");
				if ( res.msg.lng === 0 || res.msg.lat === 0 ) {
					resolve(requestData);
					return;
				}

				let lastAdcode = localStorage.getData('lastAdcode');
				Address.getRegeo(res.msg.lng,res.msg.lat,function (allText,cityd) {
					console.warn(allText,cityd);
					Address.getTransitRoute(lastAdcode.lng,lastAdcode.lat,res.msg.lng,res.msg.lat,lastAdcode.city,cityd,function (route) {
						requestData.route = route;
						resolve(requestData);
					},function () {
						resolve(requestData);
					});
				},function (err) {
					console.error(err);
					resolve(requestData);
				});
			},function (err) {
				reject(err);
			});
		});
	},

	dealScienceDetailRequestData: function (scienceInfo) {
		return new Promise((resolve,reject) => {
			let requestData = {
				_id:'2222222222222',
				title:'发烧',
				topImg:commonMethod.iconUrl('iconUrl','icon_search'),
				doctor:{
					name:'胡大一'
					,good:'擅长：卡沙空间哈看的哈卡机的哈可点击阿来得及阿拉丁'
					,home:'中医科'
					,position:'北京大学人民医院'
					,address:'北京大学人民医院北京大学人民医院'
					,url:commonMethod.iconUrl('iconUrl','icon_search')
					,job:'主任医师'
				},
				overview:{
				  name:'概述',
				    content:'发烧也成发烧也成发烧也成发烧也成发烧也成发烧也成发烧也成发烧也成发烧也成发烧也成发烧也成发烧也成发烧也成'
				  },
				reason:{
				  name:'病因及什么',
				    content:'原因很多大致可以分原因很多大致可以分两类：',
					list:[
				      {
				        type:'subtitle',
				        content:'1.感染性疾病'
				      },
						{
							type:'cont',
							content:'包括好多包括好多包括好多包括好多包括好多包括好多'
						},
						{
							type:'subtitle',
							content:'2.感染性疾病'
						},
						{
							type:'cont',
							content:'包括好多包括好多包括好多包括好多包括好多包括好多'
						},
						{
							type:'cont',
							content:'包括好多包括好多包括好多包括好多包括好多包括好多'
						},
						{
							type:'cont',
							content:'包括好多包括好多包括好多包括好多包括好多包括好多'
						}
				    ]
				  },
				write:[
					{
						hospitalName:'医院名称医院名称医院医院名称医院名称医院医院名称医院名称医院'
						,department:'儿童科儿童科儿童科'
						,name:'老张老张'
						,referred:'治不起'
					},
					{
						hospitalName:'医院名称医院名称医院医院名称医院名称医院医院名称医院名称医院'
						,department:'儿童科儿童科儿童科'
						,name:'老张老张'
						,referred:'治不起'
					}
				],
				audit:[
					{
						hospitalName:'医院名称医院名称医院医院名称医院名称医院医院名称医院名称医院'
						,department:'儿童科儿童科儿童科'
						,name:'老师老师'
						,referred:'治不起'
					},
					{
						hospitalName:'医院名称医院名称医院医院名称医院名称医院医院名称医院名称医院'
						,department:'儿童科儿童科儿童科'
						,name:'老师老师'
						,referred:'治不起'
					}
				],
				level:[
					{
						url:commonMethod.iconUrl('iconUrl','right'),
						className:'scienceDetailHospitalLevelImg',
						content:'综合医院'
					},
					{
						url:commonMethod.iconUrl('iconUrl','right'),
						className:'scienceDetailHospitalLevelImg',
						content:'综合医院'
					}
					],
				address:'综合医院综合医院综合医院',
				telephone:'1291927927918',
				url:'www.hahakjhak.com',
				route:'综合医院综合医院综合医院综合医院综合医院综合医院综合医院综合医院综合医院综合医院综合医院综合医院',
			};
			requestData['dataType'] = dataFormType[scienceInfo.type];

			resolve(requestData);
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

  onHide: function () {
  
  },

  onUnload: function () {
  
  }
});