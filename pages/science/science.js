

const commonMethod = require("../../utils/common");
const modalWindow = require("../../utils/modalWindow");
const localStorage = require("../../utils/localStorage");
const Const = require("../../utils/const");
const config = require("../../utils/config");
const notHeadImg = commonMethod.iconUrl('iconUrl','icon_no_head_team');
const kepuEventObj = {
	disease:'describe'
	,hospital:'hospital'
	,doctor:'doctor'
};
const NC = require("../../utils/Notification.js");
const Notify = require("../../utils/notify.js");
const oneSubTitleTextObj = {
	1:{
		text:'热门搜索',
		boolean:false
	},
	2:{
		text:'搜索结果',
		boolean:true
	}
};

Page({
	data: {
		arriveBottom:false,
		scienceDisabled:false,
		recommendedScience:1,  // 1 推荐 2 搜索 3 之间（等待）
		inputButtonObj:{
			searchType:2,
			inputText:'请输入您要查询的内容',
			describe:[
				{text:'查疾病 /'},
				{text:'找药品 /'},
				{text:'查医生 /'},
				{text:'找医院'}
			]
		},
		currentClickIndex:1,
		oneSubTitleText:oneSubTitleTextObj[1].text,
		newButtonDisabled:false,
		isShowSearchValue:oneSubTitleTextObj[1].boolean
		,isLoading:true
	},

	private: {
		recommendedScrollTop:0,
		searchScrollTop:0,
		disabledOnScroll:false,
		inputValue:'',
		scrollPosition:0,
		freshPageNum:1,
		freshSearchPageNum:1,
		searchKey:''
	},

	onLoad: function (options) {
	},

	scienceButton:function (e) {
		let event = e.detail.target.dataset.event;
		let index = e.detail.target.dataset.index;
		this.setData({scienceDisabled:true,newButtonDisabled:true});
		if ( !e.detail.target.dataset.event ) event = 'nullFunction';
		this[event](index,event);
	},

	deleteSearchValue: function () {
		localStorage.setData('recommendedScience',1);
		localStorage.remove(['searchValue']);
		this.onShow();
	},

	nullFunction: function () {
		this.setData({scienceDisabled:false,newButtonDisabled:false});
	},

	inputButton: function () {
		wx.navigateTo({
			url: '../search/search?from=2'
		});
	},

	recommendedEvent: function (index) {
		let that = this;
		localStorage.setData('scienceInfo',that.data.recommendedArr[index]);
		localStorage.setData('searchKey',that.data.recommendedArr[index].title);
		wx.navigateTo({
			url: '../scienceDetails/scienceDetails'
		});
	},

	searchScienceEvent: function (index) {
		let that = this;
		localStorage.setData('scienceInfo',that.data.searchScienceArr[index]);
		wx.navigateTo({
			url: '../scienceDetails/scienceDetails'
		});
	},

	bindConfirm: function (e) {
		let that = this;
		let value = commonMethod.deleteSpace(e.detail.value);
		console.log(value,value.length);
		that.setData({focus:false});

	},

	onShow: function () {
		let that = this;
		this.setData({scienceDisabled:false,newButtonDisabled:false});
		do {
			if ( !localStorage.exists('recommendedScience') ) break;

			let inputButtonObj = that.data.inputButtonObj;
			let inputButtonObjInputText = '请输入您要查询的内容';
			if ( parseInt(localStorage.getData('recommendedScience')) === 2 ) {
				inputButtonObjInputText = localStorage.exists('searchValue') ? localStorage.getData('searchValue') : '请输入您要查询的内容';
			}
			inputButtonObj.inputText = inputButtonObjInputText;
			that.setData({
				recommendedScience:parseInt(localStorage.getData('recommendedScience'))
				,oneSubTitleText:oneSubTitleTextObj[localStorage.getData('recommendedScience')].text
				,isShowSearchValue:oneSubTitleTextObj[localStorage.getData('recommendedScience')].boolean
				,inputButtonObj:inputButtonObj
			});
		}while (false);

		if ( localStorage.exists('recommendedScience') &&
			parseInt(localStorage.getData('recommendedScience')) === 2  &&
			!localStorage.exists('searchValue')
		) {
			NC.addObserver(this, 'OnSearchChanged', Notify.SearchChanged.name);
			return;
		}

		if ( localStorage.exists('recommendedScience') &&
			parseInt(localStorage.getData('recommendedScience')) === 2  &&
			localStorage.exists('searchValue')
		) {
			that.piepline();
			return;
		}

		this.dealRecommendedRequestData(1,'')
			.then(res => {
				that.setData({
					arriveBottom:false,
					recommendedArr:res,
					notMoreCont:false
					,isLoading:false
				});
				wx.hideLoading();
			})
			.catch(err => {
				console.error(err);
				modalWindow.clickModal({
					content:'获取科普信息失败，请稍后重试。'
					,showCancel:false
				});
			});
	},

	onUnload: function () {
		NC.removeObserverAllNotification(this);
	},

	OnSearchChanged: function () {
		this.piepline();
	},

	piepline: function () {
		let that = this;
		let value = localStorage.getData('searchValue');
		if ( that.private.searchKey !==  value ) {
			wx.pageScrollTo({
				scrollTop: 0
			});
		}
		that.dealRecommendedRequestData(1,value,false)
			.then(res => {
				that.private.inputValue = value;
				that.setData({
					recommendedScience:2,
					searchScienceArr:res,
					notMoreCont:false
					,isLoading:false
				});
			})
			.catch(err => {
				modalWindow.clickModal({
					content:'搜索失败，请稍后重试。'
					,showCancel: false
				});
			})
	},

	dealRecommendedRequestData: function (page,keyword,isRecommend = true) {
		let that = this;
		return new Promise((resolve,reject) => {
			getApp().shortRequest('search',{page:page,pageSize:10,keyword:keyword},function (res) {
				console.log(res);
				if ( res.code !== Const.Code.SUC ) {
					reject(res);
					return;
				}

				let event;
				if ( isRecommend ) {
					that.private.freshRecommendPageNum = page + 1;
					event = 'recommendedEvent';
				} else {
					that.private.freshSearchPageNum = page + 1;
					event = 'searchScienceEvent';
					localStorage.setData('searchKey',keyword);
					that.private.searchKey = keyword;
				}
				Promise.all(res.data.map(value => that[kepuEventObj[value.type]](value,event)))
					.then(data => {
						console.log(data);
						resolve(data);
					})
					.catch(err => {
						console.error(err);
						reject(err);
					});
			},function (err) {
				console.error(err);
				reject(err);
			});
		});
	},

	describe: function (value,event) {
		return new Promise((resolve,reject) => {
			resolve({
				type:'describe',
				title:value.name,
				content:value.description,
				label:value.type_name
				,_id:value.id
				,event:event
			})
		});
	},

	hospital: function (value,event) {
		return new Promise((resolve,reject) => {
			let type = 'hospitalImg';
			if ( value.pic === "" ) {
				type = 'hospitalText';
			}
			resolve({
				type:type,
				title:value.name,
				level:value.grade,
				address:value.address
				,_id:value.id
				,img:value.pic || ''
				,event:event
			})
		});
	},

	doctor: function (value,event) {
		return new Promise((resolve,reject) => {
			resolve({
				type:'doctor',
				name:value.doctor_name,
				position:value.doctor_rank || '' // 职位
				,_id:value.id
				,content:value.doctor_good_at || ''  // 擅长
				,address:value.doctor_hospital || ''
				,img:value.doctor_avatar || notHeadImg
				,doctor_office:value.doctor_office || '' // 科室
				,event:event
				,title:value.doctor_name
			});
		});
	},

	onPageScroll: function (e) {
		this.private.scrollPosition = e.scrollTop;
		if ( this.data.recommendedScience === 1 && !this.private.disabledOnScroll ) {
			this.private.recommendedScrollTop = e.scrollTop;
			return;
		}

		this.private.searchScrollTop = e.scrollTop;
	},

	onReachBottom: function () {
		let recommendedScience = this.data.recommendedScience;
		let that = this;
		if ( recommendedScience === 1 || recommendedScience === 2 ) {
			this.setData({notMoreCont:false});
			this.setData({arriveBottom:true});
		}
		if ( this.data.recommendedScience === 1 ) {
			this.dealRecommendedRequestData(that.private.freshRecommendPageNum,'',true)
				.then(res => {
					that.setData({
						arriveBottom:false,
						recommendedArr:that.data.recommendedArr.concat(res)
					});
					if ( res.length === 0 ) {
						this.setData({notMoreCont:true});
					}
				})
				.catch(err => {
					modalWindow.clickModal({
						content:'获取科普信息失败，请稍后重试。'
						,showCancel:false
					});
				});
			return;
		}

		if ( this.data.recommendedScience === 2 ) {
			this.dealRecommendedRequestData(that.private.freshSearchPageNum,that.private.searchKey,false)
				.then(res => {
					that.setData({
						arriveBottom:false,
						searchScienceArr:that.data.searchScienceArr.concat(res)
					});
					if ( res.length === 0 ) {
						this.setData({notMoreCont:true});
					}
				})
				.catch(err => {
					modalWindow.clickModal({
						content:'获取科普信息失败，请稍后重试。'
						,showCancel:false
					});
				});
		}
	}
});