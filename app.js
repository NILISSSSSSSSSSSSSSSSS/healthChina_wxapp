

let Client = require("stm/client.js").Client;
let config = require("/utils/config.js");
let Const = require("/utils/const.js");
let NC = require('/utils/Notification.js');
let Notify = require('/utils/notify.js');
let Address = require('/utils/address.js');
let localStorage = require('/utils/localStorage.js');

App({
	onLaunch: function () {
		let client = this.client;
		client.setConnectArgs(config.url, function () {
			console.log("net success");
		}, function (err) {
			console.error("net error " + err);
		});
		client.setConfig(50);
		client.onPush = function (data) {
			console.log('recive message', JSON.parse((new Client.StringView(data)).toString()));
		};
	},

	addFormID: function (formid) {
		this.request('/api/php/WxAppAddFormId', {formid: formid}, function (d) {
			console.log(d);
		}, function (e) {
			console.log(e);
		});
	},

	shortRequest(api, body, onSuccess, onFailed, onComplete) {
		let that = this;
		body = body || {};
		let fail = onFailed || function () {
		};
		let complete = onComplete || function () {
		};
		let url = config.url + api;

		wx.request({
			url: url,
			method: 'POST',
			data: body,
			header: {
				'content-type': 'application/json'
			},
			success: function (res) {
				res = res.data;
				onSuccess(res);

			},
			fail: fail,
			complete: complete
		})
	},

	request: function (api,method, body, onSuccess, onFailed, onComplete) {
		let that = this;
		let body1 = {};
		body1.app_token = this.getChatToken();
		body1.para = body || {};
		this.client.addJsonRequest(body1, function (res) {
			if (res.code == Const.Code.TOKEN_ERROR
				|| res.code == Const.Code.CODE_TOKEN_ERROR) {
				setTimeout(function () {
					that.request(api, body, onSuccess, onFailed, onComplete);
				}, 0);
			} else if (onSuccess) {
				onSuccess(res);
			}
		}, {api: api}, onFailed, onComplete);
	},

	urlRequest(url,method = 'GET', body, onSuccess, onFailed, onComplete) {
		let that = this;
		body = body || {};
		let fail = onFailed || function () {
		};
		let complete = onComplete || function () {
		};

		wx.request({
			url: url,
			method: method,
			data: body,
			header: {
				'content-type': 'application/json'
			},
			success: function (res) {
				res = res.data;
				onSuccess(res);

			},
			fail: fail,
			complete: complete
		})
	},

	onShow: function () {
		Address.getAdcodeHere(
			function(){console.log("gps success")},
			function(){console.error("gps fail")}
		);
	},

	onHide: function () {

	},

	client: new Client(),
	waitLogin: [],
	shortWaitLogin: []
});