/**
 * Created by xpwu on 2017/3/5.
 */


const key = "oss_upload_token";
let config = require("./config.js");

let Const = require('./const.js');

let fileNet = require('./fileNet');

let sha1 = require("sha1");

const sts_key = "sts";
function getSTS(onSuccess, onFailed) {
  let sts = wx.getStorageSync(sts_key) || {timestamp: 0};
  if (sts.timestamp*1000 < new Date().getTime()) {
    getApp().request("GetSTS", {}, (res)=>{
      wx.setStorageSync(sts_key, res);
      onSuccess(res);
    }, (error)=>{onFailed(error);});
    return;
  }

  setTimeout(()=>{onSuccess(sts);}, 0);
}

let OSS = {
  /**
   *
   * @param {string} filePath
   * @param {string} oss_filename
   * @param {function:()} onsuccess
   * @param {function:(error)} onfailed
   */
  upload: function (filePath, oss_filename, onsuccess, onfailed) {
    /**
     * @var {{ak:string,sign:string,policy:string,token:string,timestamp:int,host:string}} token
     */
    let token = wx.getStorageSync(key) || {};

    let now = new Date(); //s
    if (!token.timestamp || token.timestamp < now + 5*60) {
      getApp().request('GetOSSUploadToken', {}, function (res) {
        /**
         * @var {{ak:string,sign:string,policy:string,token:string,timestamp:int,host:string}} res
         */
        if (res.code != Const.Code.SUC) {
          onfailed("get token error, code = " + res.code);
          return;
        }
        wx.setStorageSync(key, res);

        wx.uploadFile({
          url: config.oss_lock_url,
          filePath: filePath,
          name: "file",
          // header: {Host: res.host},
          formData: {
            OSSAccessKeyId: res.ak,
            key: oss_filename,
            success_action_status: '200',
            policy: res.policy,
            Signature: res.sign,
            'x-oss-security-token': res.token
          },
          success: function (res) {
            onsuccess();
          },
          fail: function (error) {
            onfailed("upload error: " + JSON.stringify(error));
          }
        });
      }, function (error) {
        onfailed("get token error. " + error);
      })
    } else {
      wx.uploadFile({
        url: config.oss_lock_url,
        filePath: filePath,
        name: "file",
        // header: {Host: token.host},
        formData: {
          OSSAccessKeyId: token.ak,
          key: oss_filename,
          success_action_status: '200',
          policy: token.policy,
          Signature: token.sign,
          'x-oss-security-token': token.token
        },
        success: function (res) {
          onsuccess();
        },
        fail: function (error) {
          onfailed("upload error: " + JSON.stringify(error));
        }
      });
    }
  },
  /**
   *
   * @param {string} shorturl
   * @param {function:(string)} onsuccess
   * @param {function:(error)} onfailed
   */
  downloadPublic(shorturl, onsuccess, onfailed) {
    onfailed = onfailed || function (err) {
        console.error(err);
      };
    onsuccess = onsuccess || function () {};

    fileNet.wxDownloadFile({
      url: shorturl,
      header: {},
      success: function (res) {
        onsuccess(res.tempFilePath);
      },
      fail: function (err) {
        onfailed(err||"wx.downloadFile error");
      }
    });
  }
};

module.exports = OSS;
