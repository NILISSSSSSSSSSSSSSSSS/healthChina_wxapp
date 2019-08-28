

let changedConfig = require('changedConfig.js');

function clickModal(data = {},callback = function (res) {}) {
	wx.showModal({
		title:data.title || "",
		content: data.content || "",
		showCancel: data.showCancel || false,
		confirmColor: changedConfig.modalButtonColor.confirmColor || "#f8665a",
		confirmText:data.confirmText || "确定",
		cancelColor:changedConfig.modalButtonColor.cancelColor || "#000000",
		cancelText:data.cancelText || "取消",
		success:function (res) {
			callback(res);
		}
	});
}

module.exports = {
	clickModal:clickModal
};