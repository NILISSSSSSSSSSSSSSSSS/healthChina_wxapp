

const commonMethod = require("../../utils/common");
const modalWindow = require("../../utils/modalWindow");
const localStorage = require("../../utils/localStorage");
const Const = require("../../utils/const");
const config = require("../../utils/config");

const notHeadImg = commonMethod.iconUrl('iconUrl','defualthead');
const indexQueryImgObj = {
	zhengWu:{
		0:{image:commonMethod.iconUrl('iconUrl','zwcx'),className:'zhengWuButtonSelected'}
		,1:{image:commonMethod.iconUrl('iconUrl','zizwcx'),className:'zhengWuButtonNotSelect'}
	}
	,jiBing:{
		0:{image:commonMethod.iconUrl('iconUrl','zijbcx'),className:'jiBingButtonNotSelect'}
		,1:{image:commonMethod.iconUrl('iconUrl','jbcx'),className:'jiBingButtonSelected'}
	}
};

Page({
  data: {
		swiperCurrent:1
    ,informationDisabled:false
		,swiperImgArr:[]
    ,informationArr:[]
		,queryObj:{}
		,inputButtonObj:{
			inputText:'请输入您要查询的疾病名称',
		}
		,currentClickIndex:0
		,oneSubTitleText:'资讯'
		,newButtonDisabled:false
		,isLoading:true
  },

	private:{
  	freshPageNum:1
	},

	returnQueryObj: function (index = 0) {
  	return {
			queryButton:[
				{image:indexQueryImgObj['zhengWu'][index].image,event:'zhengWuQuery',className:indexQueryImgObj['zhengWu'][index].className},
				{image:indexQueryImgObj['jiBing'][index].image,event:'jiBingQuery',className:indexQueryImgObj['jiBing'][index].className}
			],
				contButton:[
				{haveBorderBottom:true,haveBorderRight:true,iconText:'医',color:'#ffb60e',text:'医院等级查询',event:'zhengWuQueryButton',type:'hospitalLevel',page:'zhengWuSearch'},
				// {haveBorderBottom:true,haveBorderRight:false,iconText:'执',color:'#ff695c',text:'执业医生查询',event:'zhengWuQueryButton',type:'practiceDoctor',page:'zhengWuSearch'},
				// {haveBorderBottom:true,haveBorderRight:true,iconText:'执',color:'#04cf7f',text:'执业护士查询',event:'zhengWuQueryButton',type:'practiceNurse',page:'zhengWuSearch'},
				{haveBorderBottom:true,haveBorderRight:false,iconText:'辅',color:'#5e9eff',text:'辅助生殖机构',event:'zhengWuQueryButton',type:'assistedOrg',page:'zhengWuLook'},
				{haveBorderBottom:false,haveBorderRight:true,iconText:'器',color:'#de90ff',text:'器官移植机构',event:'zhengWuQueryButton',type:'transplantOrg',page:'zhengWuLook'},
				{haveBorderBottom:false,haveBorderRight:false,iconText:'基',color:'#e3c153',text:'基本药物目录',event:'zhengWuQueryButton',type:'medicinesList',page:'zhengWuLook'}
			]
		};
	},

	swiperChange:function(e) {
		this.setData({
			swiperCurrent:e.detail.current+1
		});
	},

	informationButton:function (e) {
		let event = e.detail.target.dataset.event;
		let index = e.detail.target.dataset.index;
		this.setData({informationDisabled:true});
		if ( !e.detail.target.dataset.event ) event = 'nullFunction';
		this[event](index,event);
	},

	nullFunction: function () {
		this.setData({informationDisabled:false,newButtonDisabled:false});
	},

	inputButton: function () {
		wx.navigateTo({
			url: '../search/search?from=1'
		});
	},

	zhengWuQueryButton: function (index) {
  	let type = this.data.queryObj.contButton[index].type;
  	let page = this.data.queryObj.contButton[index].page;
  	let url = `../${page}/${page}?type=${type}`;
		wx.navigateTo({
			url: url
		});
	},

	zhengWuQuery: function () {
  	let that = this;
		that.setData({
			currentClickIndex:0
			,newButtonDisabled:false
			,informationDisabled:false
			,queryObj:that.returnQueryObj(0)
		});
	},

	jiBingQuery: function () {
		let that = this;
		this.setData({
			currentClickIndex:1
			,newButtonDisabled:false
			,informationDisabled:false
			,queryObj:that.returnQueryObj(1)
		});
	},

	banner:function (index) {
		let that = this;
		localStorage.setData('news_id',that.data.swiperImgArr[index]._id);
		wx.navigateTo({   // canClickZan 1 yes 2 no
			url: '../newsDetail/newsDetail?id='+that.data.swiperImgArr[index]._id + '&canClickZan=2'
		});
	},

	news: function (index) {
		let that = this;
		let obj = {};
		if ( localStorage.getData('newsInfo') ) {
			obj = localStorage.getData('newsInfo');
		}

		obj[that.data.informationArr[index]._id] = that.data.informationArr[index];
		localStorage.setData('newsInfo',obj);
		localStorage.setData('news_id',that.data.informationArr[index]._id);
		wx.navigateTo({
			url: '../newsDetail/newsDetail'
		});
	},

	onLoad: function (options) {
  	let that = this;
  	that.setData({
			queryObj:that.returnQueryObj(0)
		});
  	Promise.all([that.dealNewsRequestData(1),that.dealSwiperRequestData()])
			.then(res => {
				let informationArr = res[0];
				let newsInfoLocal = localStorage.getData('newsInfo');
				if ( newsInfoLocal ) {
					for (let i = 0;i < informationArr.length; i++ ) {
						if ( newsInfoLocal[informationArr[i]._id] ) {
							informationArr[i].clickZan = newsInfoLocal[informationArr[i]._id].clickZan;
							if ( informationArr[i].zanNum <  newsInfoLocal[informationArr[i]._id].zanNum ) {
								informationArr[i].zanNum = newsInfoLocal[informationArr[i]._id].zanNum;
							}
						}
					}
				}
				that.setData({
					arriveBottom:false,
					informationArr:informationArr,
					swiperImgArr:res[1]
					,isLoading:false
				});
			})
			.catch(err => {
				modalWindow.clickModal({
					content:'获取资讯信息失败，请稍后重试。'
					,showCancel:false
				});
			});
  },

  onShow() {
		let that = this;
		that.setData({newButtonDisabled:false,informationDisabled:false});
  	let informationArr = that.data.informationArr;
  	let newsInfoLocal = localStorage.getData('newsInfo');
  	if ( !newsInfoLocal ) return;
		for (let i = 0;i < informationArr.length; i++ ) {
			if ( newsInfoLocal[informationArr[i]._id] ) {
				informationArr[i].clickZan = newsInfoLocal[informationArr[i]._id].clickZan;
				if ( informationArr[i].zanNum <  newsInfoLocal[informationArr[i]._id].zanNum ) {
					informationArr[i].zanNum = newsInfoLocal[informationArr[i]._id].zanNum;
				}
			}
		}

		that.setData({informationArr});
  },

	dealNewsRequestData: function (page) {
		let that = this;
		return new Promise((resolve,reject) => {
			let informationArr = that.data.informationArr;
			getApp().shortRequest('articleList',{page:page},function (res) {
				console.log(res);
				if ( res.code !== Const.Code.SUC ) {
					reject(res);
					return;
				}

				that.private.freshPageNum = page + 1;
				if ( res.data.length === 0 ) {
					resolve([]);
					return;
				}

				let requestData = [];
				for ( let i = 0; i < res.data.length; i++ ) {
					let type = 'informationImg',isActive = true;
					if ( !res.data[i].article_thumb || res.data[i].article_thumb === '' ) {
						type = 'informationText';
					}
					if ( !res.data[i].tags || res.data[i].tags === '' ) {
						isActive = false;
					}
					requestData.push({
						type:type,
						title:res.data[i].title,
						addressImg:res.data[i].author_logo,
						addressText:res.data[i].author,
						isActive:isActive,
						zanNum:res.data[i].like,
						_id:res.data[i]._id,
						tags:res.data[i].tags,
						clickZan:false,
						describeImg:res.data[i].author_logo || notHeadImg,
					});
				}
				resolve(requestData);
			},function (err) {
				console.error(err);
				reject(err);
			});
		});
	},

	dealSwiperRequestData: function () {
		let that = this;
		return new Promise((resolve,reject) => {
			getApp().shortRequest('getBanners',{},function (res) {
				console.log(res);
				if ( res.code !== Const.Code.SUC ) {
					reject(res);
					return;
				}

				let swiperImgArr = [];
				for ( let i = 0;i < res.data.length; i++ ) {
					swiperImgArr.push({
						img:res.data[i].article_thumb,
						subtitle:res.data[i].title,
						_id:res.data[i]._id,
					});
				}
				resolve(swiperImgArr);
			},function (err) {
				console.error(err);
				reject(err);
			});
		});
	},

	onReachBottom: function () {
  	let that = this;
  	let informationArr = that.data.informationArr;
		this.setData({notMoreCont:false});
		this.setData({arriveBottom:true});
    this.dealNewsRequestData(that.private.freshPageNum)
			.then(res => {
				that.setData({
					arriveBottom:false,
					informationArr:informationArr.concat(res)
				});
				if ( res.length === 0 ) {
					that.setData({
						notMoreCont:true
					});
				}
			})
			.catch(err => {
				modalWindow.clickModal({
					content:'获取资讯信息失败，请稍后重试。'
					,showCancel:false
				});
			});
	}
});