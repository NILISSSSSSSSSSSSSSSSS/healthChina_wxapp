

const commonMethod = require("../../utils/common");
const modalWindow = require("../../utils/modalWindow");
const localStorage = require("../../utils/localStorage");
const Const = require("../../utils/const");
const config = require("../../utils/config");
const NC = require("../../utils/Notification.js");
const Notify = require("../../utils/notify.js");
let queryObjConst = {
	hospitalLevel:{
		title:'医院等级查询',
		arr:[
      {text:'省',placeholder:'请选择省(自治区/直辖市)',type:'adCodePicker',range:[]}
			,{text:'医院类别',placeholder:'请选择医院类别',type:'hospitalCategoryPicker',range:[
				{value:'综合医院',type:'1'},
				{value:'中西医结合医院',type:'2'},
				{value:'民族医院',type:'3'},
				{value:'专科医院',type:'4'},
				{value:'疗养院',type:'5'},
				{value:'护理院（站）',type:'6'},
				{value:'社区卫生服务中心',type:'7'},
				{value:'街道卫生院',type:'8'},
				{value:'乡镇卫生院',type:'9'},
				{value:'急救中心',type:'10'},
				{value:'妇幼保健院',type:'11'},
				{value:'妇幼保健所',type:'12'},
				{value:'专科疾病防治院',type:'13'},
				{value:'专科疾病防治所（站、中心）',type:'14'},
				{value:'医学专科研究所',type:'15'},
				{value:'其他卫生事业机构',type:'16'}
			]}
			,{text:'医院等级',placeholderOne:'请选择医院级别',type:'hospitalLevelPicker',rangeCategory:[
				{value:'二级医院',grade:'2'},
				{value:'三级医院',grade:'1'}
			],rangeLevel:[
				{value:'甲等',level:'1'},
				{value:'乙等',level:'2'},
				{value:'合格',level:'3'},
				{value:'未定等',level:'4'},
				{value:'其他',level:'5'},
				{value:'未知',level:'6'}
      ],placeholderTwo:'请选择医院等级'}
      ,{text:'医院名称',placeholder:'请输入关键字',type:'oneInput',name:'name'}
    ]
  }
  ,practiceDoctor:{
		title:'医生执业注册信息查询'
		,arr:[
			{text:'省',placeholder:'请选择省(自治区/直辖市)',type:'adCodePicker',range:[]}
			,{text:'医师姓名',placeholder:'请输入关键字',type:'oneInput',name:'name'}
			,{text:'所在医疗机构',placeholder:'请输入关键字',type:'oneInput',name:'hospitalName'}
		]
	}
	,practiceNurse:{
		title:'护士执业注册信息查询'
		,arr:[
			{text:'省',placeholder:'请选择省(自治区/直辖市)',type:'adCodePicker',range:[]}
			,{text:'护士姓名',placeholder:'请输入关键字',type:'oneInput',name:'name'}
			,{text:'所在医疗机构',placeholder:'请输入关键字',type:'oneInput',name:'hospitalName'}
		]
	}
};

const instructionsObj = {
	hospitalLevel:{
		title:'医院等级查询说明'
		,arr:[
			{text:'医院信息来源截止至2018年3月26日;',type:'title',number:'1.'}
			,{text:'目前共收录了1010家医院，其中:',type:'title',number:'2.'}
			,{text:'三级医院(1010家)',type:'subTitle'}
			,[
				{text:'609家三级甲等医院',type:'cont',paddingLeft:'42rpx'}
				,{text:'173家三级乙等医院',type:'cont',paddingLeft:''}
				,{text:'174家三级未定等医院',type:'cont',paddingLeft:'42rpx'}
				,{text:'52家三级其他医院',type:'cont',paddingLeft:''}
				,{text:'2家未知等级医院',type:'cont',paddingLeft:'42rpx'}
			]
			// ,{text:'二级医院(4321家)',type:'subTitle'}
			// ,[
			// 	{text:'2073家二级甲等医院',type:'cont',paddingLeft:'42rpx'}
			// 	,{text:'754家二级乙等医院',type:'cont',paddingLeft:''}
			// 	,{text:'49家二级丙等医院',type:'cont',paddingLeft:'42rpx'}
			// 	,{text:'1086家二级未评医院',type:'cont',paddingLeft:''}
			// 	,{text:'68家二级其他医院',type:'cont',paddingLeft:'42rpx'}
			// 	,{text:'291家二级未知等级医院',type:'cont',paddingLeft:''}
			// ]
			,{text:'以上医院不包括军队医院、中医院;',type:'title',number:'3.'}
			,{text:'如果信息有疑问，请将问题已邮件的方式发送至:',type:'title',number:'4.'}
			,{text:'service@hqms.org.cn',type:'colorTitle'}
		]
	}
	,practiceDoctor:{
		title:'执业医生查询说明'
		,arr:[
			{text:'所有查询条件为必填项;',type:'title',number:'1.'}
			,{text:'姓名: 请输入全名;',type:'title',number:'2.'}
			,{text:'所有医疗机构: 至少输入机构名称中连续的4个字即可模糊查询。比如: 医疗机构名称为“中国医学科学院北京协和医院”，输入“协和医院”即可.',type:'title',number:'3.'}
		]
	}
	,practiceNurse:{
		title:'执业护士查询说明'
		,arr:[
			{text:'所有查询条件为必填项;',type:'title',number:'1.'}
			,{text:'姓名: 请输入全名;',type:'title',number:'2.'}
			,{text:'所有医疗机构: 至少输入机构名称中连续的4个字即可模糊查询。比如: 医疗机构名称为“中国医学科学院北京协和医院”，输入“协和医院”即可.',type:'title',number:'3.'}
		]
	}
};

Page({
  data: {
		queryObj:{}
    ,otherQueryObj: {
			adCodePicker:{
				rangeIndex:0,
				isShowAdCodeRangeValue:false
      }
      ,hospitalCategoryPicker:{
				rangeIndex:0,
				isShowAdCodeRangeValue:false
      }
			,hospitalLevelOnePicker:{
				rangeIndex:0,
				isShowAdCodeRangeValue:false
			}
			,hospitalLevelTwoPicker:{
				rangeIndex:0,
				isShowAdCodeRangeValue:false
			}
    }
    ,instructionsArr:{}
    ,newButtonDisabled:false
		,firstEnter:false
		,isShowWarnDescribe:false
		,type:''
		,emptyQueryResultText:''
		,showPracticeDoctorTc:false
		,currentClickDoctorInfo:{}
		,showTcMaxHeight:''
		,warnDescribeText:''
  },

	private:{
  	type:''
		,needWriteAnswerObj:{}
		,adCodeObj:{}
		,showTcMaxHeight:''
		,needWriteAnswerObjTwo:{}
	},

	dealAdCodeArr: function (adCodeArr) {
		for ( let key in  queryObjConst ) {
			for ( let i = 0;i<queryObjConst[key].arr.length;i++ ) {
				let arr = [{name:'全国',adcode:'86'}];
				if ( queryObjConst[key].arr[i].type === 'adCodePicker' ) {
					arr = arr.concat(adCodeArr);
					queryObjConst[key].arr[i].range = arr;
				}
			}
		}
		return queryObjConst;
	},

	changeAdCodeToObj: function (adCodeArr) {
  	let obj = {};
		for ( let i = 0;i<adCodeArr.length;i++ ) {
			obj['86'] = '全国';
			obj[adCodeArr[i].adcode] = adCodeArr[i].name;
		}
		return obj;
	},

	getWarnDescribe: function (identity) {
  	if ( !identity ) return;

		let that = this;
		return new Promise((resolve,reject) => {
			getApp().shortRequest('api/home/UpdateTimeInfo',{identity:identity},function (res) {
				res.api = 'UpdateTimeInfo';
				if ( res.code !== Const.Code.NewSuc ) {
					reject(res);
					return;
				}

				that.setData({warnDescribeText:res.info ? res.info : '' });
				resolve(res.info);
			},function (err) {
				err.api = that.returnApiText();
				reject(err);
			});
		});
	},

	returnWarnDescribeApi: function (type) {
		let map = new Map([
			['practiceDoctor','doctor']
			,['practiceNurse','nurse']
		]);
		if ( !map.has(type) ) return false;

		return map.get(type);
	},

  onLoad: function (options) {
    let that = this;
    if ( options.type ) {
    	that.getWarnDescribe(that.returnWarnDescribeApi(options.type));
			that.private.type = options.type;
			if ( that.returnNeedWriteAnswer(options.type) ) {
    		that.getOrgTreeNodes()
					.then(res => {
						console.log(res);
						that.private.adCodeObj = that.changeAdCodeToObj(res);
						queryObjConst  = that.dealAdCodeArr(res);
						console.log('------- queryObjConst -----',queryObjConst);
						let queryObj = queryObjConst[options.type];
						commonMethod.setNavigationTitle(queryObj.title);
						that.private.needWriteAnswerObj = that.returnNeedWriteAnswer(options.type);
						let maxLengthWidth = that.getMaxHtmlStr(queryObj.arr);
						let firstEnter = true;
						if ( localStorage.exists('queryTypeObj') && localStorage.getData('queryTypeObj')[options.type] ) {
							firstEnter = false;
						}
						that.setData({
							queryObj:queryObj
							,maxLengthWidth:maxLengthWidth*32+'rpx'
							,instructionsArr:instructionsObj[options.type]
							,firstEnter:firstEnter
							,isShowWarnDescribe:that.getNeedShowWarnDescribe(options.type)
							,type:options.type
							,emptyQueryResultText:that.returnEmptyQueryResultText(options.type)
						});
					})
					.catch(err => {
						modalWindow.clickModal({
							content:'获取省份列表失败'
							,mask:config.mask
							,showCancel:false
						})
					});
			}
		}
  },

	getNeedShowWarnDescribe: function (type) {
		let map = new Map([
			['hospitalLevel',false]
			,['practiceDoctor',true]
			,['practiceNurse',true]
		]);
		if ( !map.has(type) ) return false;

		if ( !this.data.warnDescribeText ) return false;

		return map.get(type);
	},

	returnNeedWriteAnswer: function (type) {
		let map = new Map([
			['hospitalLevel',{adcode:'',type:0,grade:0,level:0,name:''}]
			,['practiceDoctor',{adcode:'',name:'',hospitalName:''}]
			,['practiceNurse',{adcode:'',name:'',hospitalName:''}]
		]);
		if ( map.has(type) ) {
			return map.get(type);
		}

		return false;
	},

	returnEmptyQueryResultText: function (type) {
		let map = new Map([
			['hospitalLevel','没有搜到相关内容']
			,['practiceDoctor','没有查询到符合条件的执业医师']
			,['practiceNurse','没有查询到符合条件的执业护士']
		]);
		if ( map.has(type) ) {
			return map.get(type);
		}
	},

  getMaxHtmlStr: function (arr) {
		let maxHtmlStrLength = 0;
		for ( let i = 0;i<arr.length;i++ ) {
			if ( arr[i].text.length > maxHtmlStrLength ) {
				maxHtmlStrLength = arr[i].text.length;
			}
    }
    return maxHtmlStrLength;
	},

	getPickerArr: function (pickerType) {
		let arr = this.data.queryObj.arr;
		for ( let i = 0;i<arr.length;i++ ) {
			if ( arr[i].type === pickerType ) {
				return arr[i];
			}
		}
	},

	adCodePickerChange: function (e) {
    let otherQueryObj = this.data.otherQueryObj;
		let pickerInfoArr = this.getPickerArr('adCodePicker').range;
		this.private.needWriteAnswerObj.adcode = pickerInfoArr[e.detail.value].adcode;
		otherQueryObj['adCodePicker'] = {rangeIndex:e.detail.value,isShowAdCodeRangeValue:true};
    this.setData({
			otherQueryObj:otherQueryObj
    });
	},

	hospitalCategoryPickerChange: function (e) {
		let otherQueryObj = this.data.otherQueryObj;
		let pickerInfoArr = this.getPickerArr('hospitalCategoryPicker').range;
		this.private.needWriteAnswerObj.type = parseInt(pickerInfoArr[e.detail.value].type);
		otherQueryObj['hospitalCategoryPicker'] = {rangeIndex:e.detail.value,isShowAdCodeRangeValue:true};
		this.setData({
			otherQueryObj:otherQueryObj
		});
	},

	hospitalLevelPickerOneChange: function (e) {
		let otherQueryObj = this.data.otherQueryObj;
		let pickerInfoArr = this.getPickerArr('hospitalLevelPicker').rangeCategory;
		this.private.needWriteAnswerObj.grade = parseInt(pickerInfoArr[e.detail.value].grade);
		otherQueryObj['hospitalLevelOnePicker'] = {rangeIndex:e.detail.value,isShowAdCodeRangeValue:true};
		this.setData({
			otherQueryObj:otherQueryObj
		});
	},

	hospitalLevelPickerTwoChange: function (e) {
		let otherQueryObj = this.data.otherQueryObj;
		let pickerInfoArr = this.getPickerArr('hospitalLevelPicker').rangeLevel;
		this.private.needWriteAnswerObj.level = parseInt(pickerInfoArr[e.detail.value].level);
		otherQueryObj['hospitalLevelTwoPicker'] = {rangeIndex:e.detail.value,isShowAdCodeRangeValue:true};
		this.setData({
			otherQueryObj:otherQueryObj
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

	instructionsTcIKnow: function () {
  	let type = this.private.type;
  	let obj = localStorage.exists('queryTypeObj') ? localStorage.getData('queryTypeObj') : {};
		obj[type] = {firstEnter:false};
		localStorage.setData('queryTypeObj',obj);
		this.setData({firstEnter:false});
	},

	returnQuery: function () {
		this.setData({
			newButtonDisabled:false
		});
		commonMethod.setNavigationTitle(this.changeTitleMap()[false]);
	},

	setShowTcMaxHeight: function () {
		let that = this;
		if ( that.private.showTcMaxHeight ) {
			that.setData({
				showTcMaxHeight:83.4+'%'
			});
			return;
		}

		setTimeout(() => {
			let selectorQueryInfo = wx.createSelectorQuery().in(that);
			selectorQueryInfo.select('.instructionsTcTemplateView').boundingClientRect(function(res){
				wx.getSystemInfo({
					success: function(sysInfo) {
						console.log(sysInfo.windowHeight);
						if ( !res || !res.height || !sysInfo || !sysInfo.windowHeight ) {
							that.private.showTcMaxHeight = 83.4 + '%';
							that.setData({
								showTcMaxHeight:83.4+'%'
							});
							return;
						}

						if ( parseInt(res.height) >= ( parseInt(sysInfo.windowHeight) * 0.834 )) {
							that.private.showTcMaxHeight = 83.4 + '%';
							that.setData({
								showTcMaxHeight:83.4+'%'
							});
						}
					},
					fail: function () {
						that.private.showTcMaxHeight = 83.4 + '%';
						that.setData({
							showTcMaxHeight:83.4+'%'
						});
					}
				});
			}).exec();
		},300);
	},

	judgeAllWrite: function () {
  	let that = this;
  	let needWriteAnswerObj = this.private.needWriteAnswerObj;
  	if ( that.private.type === 'hospitalLevel' ) {
			let [judgeAllWriteAdCode,judgeAllWriteName] = ['',''];
			for ( let key in needWriteAnswerObj ) {
				if ( key === 'adcode' ) {
					judgeAllWriteAdCode = needWriteAnswerObj[key];
					continue;
				}

				if ( key === 'name' ) {
					judgeAllWriteName = needWriteAnswerObj[key];
				}
			}
			if ( !judgeAllWriteAdCode && !judgeAllWriteName ) {
				that.setData({newButtonDisabled:false});
				wx.showToast({
					title:'请输入医院所在地或名称关键字'
					,icon:'none'
					,duration:3000
				});
				return false;
			}

			if ( !judgeAllWriteAdCode && judgeAllWriteName.length < 4 ) {
				that.setData({newButtonDisabled:false});
				wx.showToast({
					title:'所在医院名称至少输入连续的4个字'
					,icon:'none'
					,duration:3000
				});
				return false;
			}

			if ( judgeAllWriteName && !judgeAllWriteAdCode ) {
				return true;
			}

  		return true;
		}

		for ( let key in needWriteAnswerObj ) {
			if ( !needWriteAnswerObj[key] ) {
				that.setData({newButtonDisabled:false});
				wx.showToast({
					title:'所有查询条件为必填项，请完善。'
					,icon:'none'
					,duration:3000
				});
				return false;
			}

			if ( key === 'hospitalName' && needWriteAnswerObj[key].length < 4 ) {
				that.setData({newButtonDisabled:false});
				wx.showToast({
					title:'所在医疗机构至少输入连续的4个字'
					,icon:'none'
					,duration:3000
				});
				return false;
			}
		}
		return true;
	},

	changeTitleMap: function () {
  	let type = this.private.type;
		let map = new Map([
			['hospitalLevel',{true:'医院等级查询结果',false:'医院等级查询'}]
			,['practiceDoctor',{true:'执业医生查询结果',false:'执业医生查询'}]
			,['practiceNurse',{true:'执业护士查询结果',false:'执业护士查询'}]
		]);
		if ( map.has(type) ) {
			return map.get(type);
		}
	},

	queryButton: function (e) {
		let valueObj = e.detail.value;
		let that = this;
		let needWriteAnswerObj = this.private.needWriteAnswerObj;
		for ( let key in valueObj ) {
			if ( needWriteAnswerObj[key] !== undefined ) {
				needWriteAnswerObj[key] = commonMethod.deleteSpace(valueObj[key]);
			}
		}
		this.private.needWriteAnswerObj = needWriteAnswerObj;
		console.warn('--- needWriteAnswerObj ----',needWriteAnswerObj);
		if ( !that.judgeAllWrite() )  return;

		let dealNeedWriteAnswerObj = {};
		let [dealName,dealAdCode] = ['',''];
		for ( let i in needWriteAnswerObj ) {
			dealNeedWriteAnswerObj[i] =  needWriteAnswerObj[i];
			if ( i === 'adcode' ) {
				dealAdCode = needWriteAnswerObj[i];
				continue;
			}

			if ( i === 'name' ) {
				dealName = needWriteAnswerObj[i];
			}
		}
		if ( dealName && !dealAdCode ) {
			dealNeedWriteAnswerObj['adcode'] = '86';
		}
		localStorage.setData('dealNeedWriteAnswerObj',dealNeedWriteAnswerObj);
		NC.postNotification(Notify.QueryChanged.name);
		wx.navigateTo({
			url: '../searchResult/searchResult?type='+that.data.type
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

  onShow: function () {
  	this.setData({
			newButtonDisabled:false
		});
  }

  ,onReady: function () {
		let that = this;
		that.setShowTcMaxHeight();
	}
});