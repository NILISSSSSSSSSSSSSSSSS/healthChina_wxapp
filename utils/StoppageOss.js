/**
 * Created by xpwu on 2017/3/5.
 */

let OSS = require('./OSS.js');
let Md5 = require('./md5.js');

let StoppageOss = {
  /**
   *
   * @param {string} filePath wx获取到的filePath
   * @param {function:(uri)} onsuccess
   * @param {function:(error)}onfailed
   */
  upload: function (filePath, onsuccess, onfailed) {
    let ext = filePath.substring(filePath.lastIndexOf("."));
    let oss_filepath = 'stoppage/' + Md5.hex_md5((new Date()) + filePath) + ext;
    OSS.upload(filePath, oss_filepath, function () {
      onsuccess(oss_filepath);
    }, function (error) {
      onfailed(error);
    })
  }
};

module.exports = StoppageOss;

