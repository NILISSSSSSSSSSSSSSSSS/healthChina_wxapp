

const NC = require("./Notification.js");
const Notify = require("./notify.js");

let storage = {
	setData:function (key,obj) {
		wx.setStorageSync(key, obj);
	},

	getData: function (key) {
		return wx.getStorageSync(key) || {}
	},

	exists: function (key) {
		let data = wx.getStorageSync(key);
		return data !== null && data !== undefined && data !== "";
	},

	remove: function (keyArr) {
		try {
			if ( !keyArr ) return;

			for ( let i = 0;i<keyArr.length;i++ ) {
				wx.removeStorageSync(keyArr[i]);
			}
		} catch (e) {
			// Do something when catch error
		}
	},

	clear: function () {
		try {
			wx.clearStorageSync()
		} catch(e) {
			// Do something when catch error
		}
	}
};
module.exports = storage;