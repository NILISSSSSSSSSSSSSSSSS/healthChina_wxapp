

const commonMethod = require("../../utils/common");
const changedConfig = require("../../utils/changedConfig");

Page({
  data: {
		findArr: [
			{
				type:1
				,arr:[
					{text:'医院等级查询',event:'zhengWuQueryButton',type:'hospitalLevel',page:'zhengWuSearch'}
					// ,{text:'执业医生查询',event:'zhengWuQueryButton',type:'practiceDoctor',page:'zhengWuSearch'}
					// ,{text:'执业护士查询',event:'zhengWuQueryButton',type:'practiceNurse',page:'zhengWuSearch'}
					,{text:'辅助生殖机构',event:'zhengWuQueryButton',type:'assistedOrg',page:'zhengWuLook'}
					,{text:'器官移植机构',event:'zhengWuQueryButton',type:'transplantOrg',page:'zhengWuLook'}
					,{text:'基本药物目录',event:'zhengWuQueryButton',type:'medicinesList',page:'zhengWuLook'}
				]
			}
			,{
				type:2
  			,arr:[
					{text:'查看附近机构',event:'institutionsEvent'}
				]
			}
			,{
				type:3
  			,arr:[
					{text:'进入在线测试',event:'testEvent'}
				]
			}
		]
		,newButtonDisabled:false
  },

	serviceButton: function (e) {
		let event = e.detail.target.dataset.event;
		this.setData({serviceDisabled:true});
		if ( !e.detail.target.dataset.event ) event = 'nullFunction';
		this[event](e);
	},

	nullFunction: function () {
		this.setData({newButtonDisabled:false});
	},

	institutionsEvent: function () {
		wx.navigateTo({
			url: '../nearInstitution/nearInstitution'
		});
	},

	zhengWuQueryButton: function (e) {
		let index = e.detail.target.dataset.index;
		let type = this.data.findArr[0].arr[index].type;
		let page = this.data.findArr[0].arr[index].page;
		let url = `../${page}/${page}?type=${type}`;
		wx.navigateTo({
			url: url
		});
	},

	testEvent: function () {
    let that = this;
		wx.navigateToMiniProgram({
			appId: 'wx10c3fda05aa59bb4',
			envVersion: 'release',
			success:function (res) {
				console.log('跳转成功');
				that.setData({serviceDisabled:false});
			},
      fail:function (err) {
			  console.error(err);
				that.setData({serviceDisabled:false});
				modalWindow.clickModal({
          content:'跳转失败'
        })
			}
		});
	},

  onLoad: function (options) {
  },

  onShow: function () {
		this.setData({newButtonDisabled:false});
  }
});