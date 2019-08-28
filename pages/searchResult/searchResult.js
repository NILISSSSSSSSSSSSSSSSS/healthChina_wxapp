

const commonMethod = require("../../utils/common");
const modalWindow = require("../../utils/modalWindow");
const localStorage = require("../../utils/localStorage");
const Const = require("../../utils/const");
const config = require("../../utils/config");
const NC = require("../../utils/Notification.js");
const Notify = require("../../utils/notify.js");
const instructionsObj = {
	hospitalLevel:{
		title:'医院等级查询说明'
		,arr:[
			{text:'1.医院信息来源截止至2018年3月26日;',type:'title'}
			,{text:'2.目前共收录了1010家医院，其中:',type:'title'}
			,{text:'三级医院(1010家)',type:'subTitle'}
			,[
				{text:'609家三级甲等医院',type:'cont'}
				,{text:'173家三级乙等医院',type:'cont'}
				,{text:'174家三级未定等医院',type:'cont'}
				,{text:'52家三级其他医院',type:'cont'}
				,{text:'2家未知等级医院',type:'cont'}
			]
			// ,{text:'二级医院(4321家)',type:'subTitle'}
			// ,[
			// 	{text:'2073家二级甲等医院',type:'cont'}
			// 	,{text:'754家二级乙等医院',type:'cont'}
			// 	,{text:'49家二级丙等医院',type:'cont'}
			// 	,{text:'1086家二级未评医院',type:'cont'}
			// 	,{text:'68家二级其他医院',type:'cont'}
			// 	,{text:'291家二级未知等级医院',type:'cont'}
			// ]
			,{text:'3.以上医院不包括军队医院、中医院;',type:'title'}
			,{text:'4.如果信息有疑问，请将问题已邮件的方式发送至:',type:'title'}
			,{text:'service@hqms.org.cn',type:'colorTitle'}
		]
	}
	,practiceDoctor:{
		title:'执业医生查询说明'
		,arr:[
			{text:'1.所有查询条件为必填项;',type:'title'}
			,{text:'2.姓名: 请输入全名;',type:'title'}
			,{text:'3.所有医疗机构: 至少输入机构名称中连续的4个字即可模糊查询。比如: 医疗机构名称为“中国医学科学院北京协和医院”，输入“协和医院”即可.',type:'title'}
		]
	}
	,practiceNurse:{
		title:'执业护士查询说明'
		,arr:[
			{text:'1.所有查询条件为必填项;',type:'title'}
			,{text:'2.姓名: 请输入全名;',type:'title'}
			,{text:'3.所有医疗机构: 至少输入机构名称中连续的4个字即可模糊查询。比如: 医疗机构名称为“中国医学科学院北京协和医院”，输入“协和医院”即可.',type:'title'}
		]
	}
};
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

const moreImgObj = {
	true:commonMethod.iconUrl('iconUrl','dtriangle')
	,false:commonMethod.iconUrl('iconUrl','xtriangle')
};

Page({
	data: {
		instructionsArr:{}
		,newButtonDisabled:false
		,type:''
		,emptyQueryResultText:''
    ,showPracticeDoctorTc:false
		,currentClickDoctorInfo:{}
		,showTcMaxHeight:''
		,isLoading:true
	},

	private:{
		type:''
		,adCodeObj:{}
		,showTcMaxHeight:''
	},

	changeAdCodeToObj: function (adCodeArr) {
		let obj = {};
		for ( let i = 0;i<adCodeArr.length;i++ ) {
			obj['86'] = '全国';
			obj[adCodeArr[i].adcode] = adCodeArr[i].name;
		}
		return obj;
	},

	onLoad: function (options) {
		let that = this;
		if ( options.type ) {
			that.private.type = options.type;
			let dealNeedWriteAnswerObj = localStorage.getData('dealNeedWriteAnswerObj');
      that.getOrgTreeNodes()
        .then(res => {
          console.log(res);
          that.private.adCodeObj = that.changeAdCodeToObj(res);
					commonMethod.setNavigationTitle(that.changeTitleMap());
					if ( localStorage.exists('dealNeedWriteAnswerObj') ) {
					  that.piepline();
					  return;
          }

					NC.addObserver(this, 'OnQueryChanged', Notify.QueryChanged.name);
        })
        .catch(err => {
          modalWindow.clickModal({
            content:'获取省份列表失败'
            ,mask:config.mask
            ,showCancel:false
          })
        });
		}
	},

	OnQueryChanged: function () {
    this.piepline();
	},

  piepline: function () {
	  let that = this;
	  let dealNeedWriteAnswerObj = localStorage.getData('dealNeedWriteAnswerObj');
		that.queryApi(dealNeedWriteAnswerObj)
			.then(res => {
				console.log(res);
				let queryResultArr = that[that.getDealFun(that.private.type)](res);
				that.setData({
					isLoading:false
					,type:that.private.type
					,emptyQueryResultText:that.returnEmptyQueryResultText(that.private.type)
					,queryResultArr:queryResultArr
					,newButtonDisabled:false
					,instructionsArr:instructionsObj[that.private.type]
				});
			})
			.catch(err => {
				console.error(err);
				modalWindow.clickModal({
					content:'查询失败，请稍后重试！'
					,mask:config.mask
					,showCancel:false
				});
			});
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
		let queryResultArr = this.data.queryResultArr;
		queryResultArr[index].imageUrl = moreImgObj[!queryResultArr[index].isShow];
		queryResultArr[index].isShow = !queryResultArr[index].isShow;
		this.setData({
			newButtonDisabled:false
			,queryResultArr:queryResultArr
		});
	},

	returnQueryResult: function () {
		this.setData({
			showPracticeDoctorTc:false
			,currentClickDoctorInfo:[]
			,newButtonDisabled:false
		});
	},

	getDetails: function (e,index) {
		let that = this;
		that.setData({
			showPracticeDoctorTc:true
			,currentClickDoctorInfo:that.data.queryResultArr[index]
			,newButtonDisabled:false
		});
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
						if ( parseInt(res.height) >= parseInt(sysInfo.windowHeight) ) {
							that.private.showTcMaxHeight = 83.4 + '%';
							that.setData({
								showTcMaxHeight:83.4+'%'
							});
						}
					}
				});
			}).exec();
		},150);
	},

	changeTitleMap: function () {
		let type = this.private.type;
		let map = new Map([
			['hospitalLevel','医院等级查询结果']
			,['practiceDoctor','执业医生查询结果']
			,['practiceNurse','执业护士查询结果']
		]);
		if ( map.has(type) ) {
			return map.get(type);
		}
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

	returnApiText: function () {
		let type = this.private.type;
		let map = new Map([
			['hospitalLevel','api/home/GovernmentAffairsSearch']
			,['practiceDoctor','api/home/DoctorSearch']
			,['practiceNurse','api/home/NurseSearch']
		]);
		if ( map.has(type) ) {
			return map.get(type);
		}
	},

	queryApi: function (data) {
		let that = this;
		return new Promise((resolve,reject) => {
			getApp().shortRequest(that.returnApiText(),data,function (res) {
				res.api = that.returnApiText();
				if ( res.code !== Const.Code.NewSuc ) {
					reject(res);
					return;
				}

				resolve(res.items);
			},function (err) {
				err.api = that.returnApiText();
				reject(err);
			});
		});
	},

	getDealFun: function (type) {
		let map = new Map([
			['hospitalLevel','dealHospitalLevelResult']
			,['practiceDoctor','dealPracticeDoctorResult']
			,['practiceNurse','dealPracticeNurseResult']
		]);
		if ( !map.has(type) ) {
			return false;
		}

		return map.get(type);
	},

	getCityName: function (adcode) {
		return this.private.adCodeObj[adcode] ? this.private.adCodeObj[adcode]:'未知城市';
	},

	getTypeName: function (type) {
		let pickerInfoArr = this.getPickerArr('hospitalCategoryPicker').range;
		for ( let i = 0;i<pickerInfoArr.length;i++ ) {
			if ( parseInt(type) === parseInt(pickerInfoArr[i].type) ) {
				return pickerInfoArr[i].value;
			}
		}
		return '未知类别';
	},

	getGradeName: function (grade) {
		let pickerInfoArr = this.getPickerArr('hospitalLevelPicker').rangeCategory;
		for ( let i = 0;i<pickerInfoArr.length;i++ ) {
			if ( parseInt(grade) === parseInt(pickerInfoArr[i].grade) ) {
				return pickerInfoArr[i].value;
			}
		}
		return '未知级别';
	},

	getPickerArr: function (pickerType) {
		let arr = queryObjConst[this.private.type].arr;
		for ( let i = 0;i<arr.length;i++ ) {
			if ( arr[i].type === pickerType ) {
				return arr[i];
			}
		}
	},

	getLevelName: function (level) {
		let pickerInfoArr = this.getPickerArr('hospitalLevelPicker').rangeLevel;
		for ( let i = 0;i<pickerInfoArr.length;i++ ) {
			if ( parseInt(level) === parseInt(pickerInfoArr[i].level) ) {
				return pickerInfoArr[i].value;
			}
		}
		return '未知等级';
	},

	getSexName: function (gender) {
		let map = new Map([
			[0,'女']
			,[1,'男']
		]);
		return map.get(gender);
	},

	dealHospitalLevelResult: function (res) {
		if ( !res ) return [];

		let that = this;
		for ( let i = 0;i<res.length;i++ ) {
			res[i]['cityName'] = that.getCityName(res[i].adcode);
			res[i].isShow = true;
			res[i].imageUrl = moreImgObj['true'];
			for ( let j = 0;j<res[i].hospital.length;j++ ) {
				res[i].hospital[j]['typeName'] = that.getTypeName(res[i].hospital[j].type);
				res[i].hospital[j]['gradeName'] = that.getGradeName(res[i].hospital[j].grade);
				res[i].hospital[j]['levelName'] = that.getLevelName(res[i].hospital[j].level);
			}
		}
		return res;
	},

	dealPracticeDoctorResult: function (res) {
		if ( !res ) return [];

		let that = this;
		for ( let i = 0;i<res.length;i++ ) {
			res[i]['cityName'] = that.getCityName(res[i].adcode);
			res[i]['sexName'] = that.getSexName(res[i].gender);
		}
		return res;
	},

	dealPracticeNurseResult: function (res) {
		if ( !res ) return [];

		let that = this;
		for ( let i = 0;i<res.length;i++ ) {
			res[i]['cityName'] = that.getCityName(res[i].adcode);
			res[i]['sexName'] = that.getSexName(res[i].gender);
		}
		return res;
	},

	onShow: function () {
		this.setData({
			newButtonDisabled:false
		});
	}
});