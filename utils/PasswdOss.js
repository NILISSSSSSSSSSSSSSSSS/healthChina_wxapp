/**
 * Created by xpwu on 2017/3/5.
 */

let OSS = require('./OSS.js');
let Md5 = require('./md5.js');

let passwdOss = {
  /**
   *
   * @param {string} filePath
   * @param {string} adcode
   * @param {string|int} number
   * @param {function(uri)} onsuccess
   * @param {function(error)}onfailed
   */
  upload: function (filePath, adcode, number, onsuccess, onfailed) {
    let ext =  filePath.substring(filePath.lastIndexOf("."));
    let oss_filepath = "passwd/" + adcode + '_'
      + Md5.hex_hmac_md5("biker_"+adcode, number)+'_'+Md5.hex_md5((new Date()) + filePath) + ext;
    OSS.upload(filePath, oss_filepath, function () {
      onsuccess(oss_filepath);
    }, function (error) {
      onfailed(error);
    })
  }
};

module.exports = passwdOss;


