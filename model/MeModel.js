/**
 * Created by xpwu on 2017/3/2.
 */


const key = 'me';

function getUid() {
  let value = wx.getStorageSync(key) || {uid: null};
  return value.uid;
}

function getToken() {
  let value = wx.getStorageSync(key) || {token: null};
  return value.token;
}

/**
 *
 * @param {{uid:string|null, token:string|null}}obj
 */
function setData(obj) {
  wx.setStorageSync(key, obj);
}

module.exports = {
  getUid: getUid,
  getToken: getToken,
  setData: setData
};
