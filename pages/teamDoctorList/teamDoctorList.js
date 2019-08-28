

const commonMethod = require("../../utils/common");
const modalWindow = require("../../utils/modalWindow");
const localStorage = require("../../utils/localStorage");
const Const = require("../../utils/const");
const config = require("../../utils/config");
const Address = require("../../utils/address");

const notHeadImg = commonMethod.iconUrl('iconUrl','defualthead');

Page({
  data: {
		notHeadImg:notHeadImg
		,noneImg:commonMethod.iconUrl('iconUrl','icon-none')
		,isLoading:true
	},

  onLoad: function (options) {
    let that = this;
    commonMethod.setNavigationTitle(options.teamName + '团队');
    this.dealTeamListRequest(options.id)
      .then(res => {
				that.setData({
					teamDoctorListArr:res
					,isLoading:false
        });
      })
      .catch(err => {
        modalWindow.clickModal({
          content:'获取'+options.teamName+'团队列表失败，请稍后重试。'
          ,showCancel:false
        });
      });
  },

	dealTeamListRequest: function (id) {
		let that = this;
		return new Promise((resolve,reject) => {
			let url = config.nearInstitutionUrl+'contract/show-other-doctor?doctor_id='+id;
			getApp().urlRequest(url,'GET',{},function (res) {
				console.log(res);
				let requestData = [];
				if ( res.data && res.data.members ) {
					requestData = res.data.members;
				}
				resolve(requestData);
			},function (err) {
				console.error(err);
				reject(err);
			});
		});
	}
});