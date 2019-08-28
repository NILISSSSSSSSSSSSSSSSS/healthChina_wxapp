

const Notify = require("notify.js");
const NC = require("Notification.js");
const modalWindow = require("modalWindow.js");
const Const = require("const.js");
const md5 = require("md5.js");

const fileUrl = {
	iconUrl:'../../image/icon/'
	,imgUrl:'../../image/img/'
};

let common = {
	formatDate: function (time_now) {
		let now = new Date(parseInt(time_now));
		let year = now.getYear() + 1900;
		let month = now.getMonth() + 1;
		let date = now.getDate();
		let hour = now.getHours();
		let minute = now.getMinutes();
		let second = now.getSeconds();
		month = (month < 10 ? "0" + month : month);
		date = (date < 10 ? "0" + date : date);
		hour = (hour < 10 ? "0" + hour : hour);
		minute = (minute < 10 ? "0" + minute : minute);
		second = (second < 10 ? "0" + second : second);
		return {
			year, month, date, hour, minute, second
		};
	},

	compare: function (prop, bigToLittle = true) {
		return function (obj1, obj2) {
			let val1 = obj1[prop];
			let val2 = obj2[prop];
			if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
				val1 = Number(val1);
				val2 = Number(val2);
			}

			if (bigToLittle) {
				if (val1 > val2) {
					return -1;
				} else if (val1 < val2) {
					return 1;
				} else {
					return 0;
				}
			} else {
				if (val1 < val2) {
					return -1;
				} else if (val1 > val2) {
					return 1;
				} else {
					return 0;
				}
			}
		}
	},

	getCurrentZeroTimestamp: function () {
		return Date.parse(new Date(new Date().setHours(0, 0, 0, 0)));
	},

	getCurrentTimestamp: function () {
		return Date.parse(new Date());
	},

	iconUrl:function (url,iconName) {
		return `${fileUrl[url]}${iconName}.png`
	},

	isString: function(str){
		return (typeof str=='string')&&str.constructor==String;
	},

	deleteSpace: function(str){
		return str.replace(/(^\s*)|(\s*$)/g, "");
	},

	playTime: function (time) {
		if (typeof time !== 'number' || time < 0) {
			return time
		}

		let hour = parseInt(time / 3600);
		time = time % 3600;
		let minute = parseInt(time / 60);
		time = time % 60;
		let second = parseInt(time);

		return ([hour, minute, second]).map(function (n) {
			n = n.toString();
			return n[1] ? n : '0' + n
		}).join(':')
	},

	takePhone: function (number) {
		wx.makePhoneCall({
			phoneNumber: number
			,fail:function (err) {
				if ( err.errMsg.indexOf('cancel') < 0 ) {
					console.error(err);
					modalWindow.clickModal({
						content:'拨打失败，请稍后重试'
						,showCancel:false
					});
				}
			}
		});
	},

	mapNavigation: function (gpsInfo) {
		if( gpsInfo.lng === null ) {
			modalWindow.clickModal({
				title:"获取地理位置失败"
				,content:"获取地理位置失败啦！请退出稍后重试。"
				,showCancel:false
				,confirmText:"我知道了"
			});
			return;
		}

		wx.openLocation({
			latitude: Number(gpsInfo.lat),
			longitude:Number(gpsInfo.lng),
			name:gpsInfo.address
		});
	},

	setNavigationTitle: function (title) {
		wx.setNavigationBarTitle({
			title: title
		});
	},

	getMaxHtmlStr: function (arr) {
		let maxHtmlStrLength = 0;
		for ( let i = 0;i<arr.length;i++ ) {
			for ( let j = 0;j<arr[i].contButton.length;j++ ) {
				if ( arr[i].contButton[j].text.length > maxHtmlStrLength ) {
					maxHtmlStrLength = arr[i].contButton[j].text.length;
				}
			}
		}
		return maxHtmlStrLength;
	}
};
module.exports = common;