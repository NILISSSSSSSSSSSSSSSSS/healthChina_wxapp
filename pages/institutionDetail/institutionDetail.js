

const commonMethod = require("../../utils/common");
const modalWindow = require("../../utils/modalWindow");
const localStorage = require("../../utils/localStorage");
const Const = require("../../utils/const");
const config = require("../../utils/config");
const Address = require("../../utils/address");

const notHeadImg = commonMethod.iconUrl('iconUrl','icon_no_head_team');

const navigationTitle = {
	0:'机构介绍',
	1:'家医团队'
};

Page({
  data: {
		swiperIndex:0
    ,institutionDetailDisabled:false
    ,notHeadImg:notHeadImg
    ,swiperInstitutionArr:[{},{doctorTeamArr:[]}]
		,noneImg:commonMethod.iconUrl('iconUrl','icon-none')
		,isLoading:true
  },

  onLoad: function (options) {
    let that = this;
		commonMethod.setNavigationTitle(navigationTitle[that.data.swiperIndex]);
    Promise.all([that.dealInstitutionInfoRequest(options.id)])
      .then(res => {
        that.setData({
					swiperInstitutionArr:res[0]
					,isLoading:false
        });
      });
  },

	swiperChange: function (e) {
    let current = e.detail.current;
    commonMethod.setNavigationTitle(navigationTitle[current]);
		this.setData({
			swiperIndex:current
		});
	},

	institutionDetailButton:function (e) {
		let event = e.detail.target.dataset.event;
		let index = e.detail.target.dataset.index;
		this.setData({institutionDetailDisabled:true});
		if ( !e.detail.target.dataset.event ) event = 'nullFunction';
		this[event](index);
	},

	nullFunction: function () {
		this.setData({institutionDetailDisabled:false});
	},

	topButton: function (index) {
		this.setData({institutionDetailDisabled:false});
		this.setData({
			swiperIndex:index
		});
	},

	takePhone: function (index) {
		this.setData({institutionDetailDisabled:false});
		if ( !index || index === '' ) return;

		commonMethod.takePhone(index);
	},

	doctorTeamButton: function (index) {
    let that = this;
		let doctorTeamArr = that.data.swiperInstitutionArr[1].doctorTeamArr;
		wx.navigateTo({
			url: '../teamDoctorList/teamDoctorList?id='+doctorTeamArr[index].id+'&teamName='+doctorTeamArr[index].name
		});
	},

	dealInstitutionInfoRequest: function (id) {
		let that = this;
		return new Promise((resolve,reject) => {
			let url = config.nearInstitutionUrl+'contract/organization?id='+id;
			getApp().urlRequest(url,'GET',{},function (res) {
				console.log(res);
				if ( res.status_code !== Const.Code.NearSuc ) {
					reject(res);
					return;
				}

				let requestData = [];
				let data = res.data;
				let tel = data.sign_contract_info.hotline_area_code + '-' + data.sign_contract_info.hotline_tel;
				if ( !data.sign_contract_info.hotline_area_code || data.sign_contract_info.hotline_area_code === '' ) {
					tel = data.sign_contract_info.hotline_tel;
        }
				requestData.push({
					img:'https:'+data.sign_contract_info.organ_image_url
          ,address:data.city+data.address
          ,tel:tel
          ,orgDescribe:data.sign_contract_info.organ_intro
        });
				let doctorTeamArr = data.team_lists;
				for ( let i = 0;i < doctorTeamArr.length;i++) {
					if ( !doctorTeamArr[i].heal_url || doctorTeamArr[i].heal_url.indexOf('cf368671-c07c-4114-8717-601b4323be62') >= 0 ) {
						doctorTeamArr[i].heal_url = notHeadImg;
					} else {
						doctorTeamArr[i].heal_url = 'https:'+doctorTeamArr[i].heal_url+'?imageView2/3/w/400/format/png';
					}
				}
				requestData.push({doctorTeamArr:doctorTeamArr});
				resolve(requestData);
			},function (err) {
				console.error(err);
				reject(err);
			});
		});
	},

	onShow: function () {
    this.setData({institutionDetailDisabled:false});
  },
  
  onUnload: function () {
    localStorage.remove(['teamDoctorInfo']);
	}
});