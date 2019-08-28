

let NC = require('../utils/Notification.js');
let Notify = require('../utils/notify.js');

const key = "initData";

function exists() {
	let data = wx.getStorageSync(key);
	console.log('initModel data', data);
	return data != null && data != undefined && data != "";
}

function getLogin() {
	let old = wx.getStorageSync(key) || {};
	return old.isBindTel;
}

function set(obj, post) {
	let old = wx.getStorageSync(key) || {};
	if (obj.time !== undefined) {
		old.time = obj.time;
	}
	wx.setStorageSync(key, old);
	if (post !== false) {
		post = true;
	}
	if (post) {
		NC.postNotification(Notify.InitDataChanged.name);
	}
}

module.exports = {
	getLogin: getLogin,
	set: set
};
