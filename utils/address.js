/**
 * Created by xpwu on 2017/4/10.
 */


const invalidLng = -200;
const invalidLat = -100;
const gpsKey = 'lastUserGps';
const adcodeKey = 'lastAdcode';

const commonMethod = require("./common");

let AMapWX = require("./amap-wx").AMapWX;

/**
 *
 * @param {function(float, float)} callback  (lng:-200, lat:-100) 表示失败
 * @param interval  ms  有效期， -1 表示无穷大
 */

function getLocalGps(callback, interval=-1) {
  wx.getStorage({
    key: gpsKey,
    success: function success(res) {
      if (!res.data ||
        (((new Date()).valueOf() - res.data.timestamp) > interval)
          && interval != -1) {
        callback(invalidLng, invalidLat);
        return;
      }
      callback(res.data.lng, res.data.lat);
    },
    fail: function () {
      callback(invalidLng, invalidLat);
    }
  });
}

function setLocalGps(lng, lat) {
  wx.setStorage({
    key: gpsKey,
    data: {lng: lng, lat: lat, timestamp: (new Date()).valueOf()}
  })
}

function getLocalAdcode(interval = -1) {
  return new Promise((resolve, reject)=>{
    wx.getStorage({
      key: adcodeKey,
      success: function success(res) {
        if (!res.data ||
          (((new Date()).valueOf() - res.data.timestamp) > interval)
          && interval != -1) {
          reject(new AddError("get local adcode expired or no data"));
        }
        resolve(res.data);
      },
      fail: function () {
        reject(new AddError("getLocalAdcode error"));
      }
    });
  });
}

function setLocalAdcode(adcode, city,lat,lng,provinceCity) {
  wx.setStorage({
    key: adcodeKey,
    data: {lng:lng,lat:lat,adcode: adcode, city: city,provinceCity:provinceCity, timestamp: (new Date()).valueOf()}
  })
}

/**
 *
 * @param {function(float, float)} callback  (lng:-200, lat:-100) 表示失败
 */
function getGPS(callback) {
  let timer = setTimeout(function () {
    getLocalGps(function (lng, lat) {
      callback(lng, lat);
      callback = function () {}
    }, 45*1000);
  }, 10*1000);
  wx.getLocation({
    type: 'gcj02',
    success: function(res) {
      var lat = res.latitude;
      var lng = res.longitude;
      setLocalGps(lng, lat);
      callback(lng, lat);
      callback = function (lng, lat) {
      }
    },
    fail: function (err) {
      getLocalGps(function (lng, lat) {
        callback(lng, lat);
        callback = function () {}
      }, 45*1000);
    },
    complete: function () {
      clearTimeout(timer);
    }
  })
}

class AddError extends Error {
  constructor(err, id = 0) {
    super();
    this.id = id;
    this.err = err;
  }
}

/**
 *
 * @return {Promise.<resolve({lng:lng, lat: lat}), reject(AddError)>}
 */
function wxLocation() {
  let normal = new Promise((resolve, reject)=>{
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        var lat = res.latitude;
        var lng = res.longitude;
        resolve({lng:lng, lat: lat});
      },
      fail: function (err) {
        reject(err);
      }
    })
  });
  return Promise.race([
    normal,
    new Promise((resolve, reject)=>{
      setTimeout(function () {
        reject(new AddError("getLocation timeout"));
      }, 10*1000);
    })
  ]);
}

/**
 *
 * @param {function(float, float)} callback  (lng:-200, lat:-100) 表示失败
 */
function getRealTimeGps(callback) {
  wxLocation()
    .then((gps)=>{
      setLocalGps(gps.lng, gps.lat);
      try {
        callback(gps.lng, gps.lat);
      }catch (e) {
        console.error("callback error: " + e.message);
      }
    })
    .catch((error)=>{
      console.error(JSON.stringify(error));
      getLocalGps((lng, lat) => {
        callback(lng, lat);
      }, 45*1000);
    })
}

/**
 *
 * @param lng
 * @param lat
 * @return {Promise.<resolve(regeocodeData), reject(AddError)>}
 */
function amapGetRegeo(lng, lat) {
  let amap = new AMapWX({key:'79b04b389200e02f64488b8bcf3af0d6'});
  return new Promise((resolve, reject)=>{
    amap.getRegeo({
      location: lng.toString() + "," + lat.toString(),
      success(data) {
        if (Object.prototype.toString.call(data.data) !== '[object Array]') {
          reject(new AddError("amap.getRegeo success data error"));
          return;
        }

        resolve({regeocodeData:data.data[0].regeocodeData,city:data.city});
      },
      fail(error) {
        reject(new AddError(JSON.stringify(error)));
      }
    });
  });

  // return Promise.race([
  //   normal,
  //   new Promise((resolve, reject)=>{
  //     setTimeout(function () {
  //       reject(new AddError("getRegeo timeout"));
  //     }, 10*1000);
  //   })
  // ]);
}

/**
 *
 * @param {float} lng
 * @param {float} lat
 * @param {function({string}address)} success
 * @param {function()} failed
 */
function getRegeo(lng, lat, success, failed=function () {}) {
  amapGetRegeo(lng, lat)
    .then((data)=>{
      // try {
        success(data.regeocodeData.formatted_address,data.city);
      // }catch (e) {
      //   console.error("callback error: " + e.message);
      // }
    })
    .catch((error)=>{
      console.error(JSON.stringify(error));
      failed();
    })
}

/**
 *
 * @param {function(lng, lat, adcode, city)} onSuccess
 * @param {function()} onFailed
 */
function getAdcodeHere(onSuccess, onFailed=function () {}) {
  let lng,lat;
  wxLocation()
    .then((gps)=>{
      setLocalGps(gps.lng, gps.lat);
      return gps;
    })
    .catch((error)=>{
      console.error(JSON.stringify(error));
      return new Promise((resolve, reject)=>{
        getLocalGps((lng, lat) => {
          resolve({lng:lng, lat:lat});
        }, 10*1000);
      });
    })
    .then((gps)=>{
      if (gps.lng == invalidLng) {
        throw new AddError("get location error");
      }
      lng = gps.lng;
      lat = gps.lat;
      return amapGetRegeo(gps.lng, gps.lat);
    })
    .then((regeocode)=>{
      let com = regeocode.regeocodeData.addressComponent;
      let adcode = com.adcode;
      adcode = (typeof adcode == 'string')?adcode.substring(0,4):"";
      let city = (typeof com.city == 'string')?com.city:"";
			let provinceCity = com.province +
				((typeof com.city == 'string')?com.city:"");
      setLocalAdcode(adcode, city,lat,lng,provinceCity);
      return {adcode:adcode, city:city,lat:lat,lng:lng,provinceCity:provinceCity};
    })
    .catch((error)=>{
      console.error(JSON.stringify(error));
      return getLocalAdcode(30*60*1000);
    })
    .then((data)=>{
      try {
        onSuccess(lng, lat, data.adcode, data.city,data.provinceCity);
      }catch (e) {
        console.error("callback error: " + e.message);
      }
    })
    .catch((error)=>{
      console.error(JSON.stringify(error));
      onFailed();
    })
}

/**
 *
 * @param fromLng
 * @param fromLat
 * @param toLng
 * @param toLat
 * @param {function({distance:int, duration:int
 * , points:[{longitude:float, latitude:float}]})} onSuccess
 * @param {function()} onFailed
 */
function getWalkingRoute(fromLng, fromLat, toLng, toLat
  , onSuccess, onFailed=function () {}) {
  let amap = new AMapWX({key:'79b04b389200e02f64488b8bcf3af0d6'});
  let normal = new Promise((resolve, reject)=>{
    amap.getWalkingRoute({
      origin: fromLng.toString() + "," + fromLat.toString(),
      destination: toLng.toString() + "," + toLat.toString(),
      success(data) {
        if(data.paths && data.paths.length > 0){
          resolve(data.paths[0]);
          return;
        }
        reject(new AddError("getWalkingRoute result error"));
      },
      fail(error) {
        reject(new AddError(JSON.stringify(error)));
      }
    });
  });
  Promise.race([
    normal,
    new Promise((resolve, reject)=>{
      setTimeout(function () {
        reject(new AddError("getWalkingRoute timeout"));
      }, 10*1000);
    })
  ])
    .then((paths)=> {
      let points = [];
      let steps = paths.steps;
      for (let i = 0; i < steps.length; i++) {
        let poLen = steps[i].polyline.split(';');
        for (let j = 0; j < poLen.length; j++) {
          points.push({
            longitude: parseFloat(poLen[j].split(',')[0]),
            latitude: parseFloat(poLen[j].split(',')[1])
          })
        }
      }
      try {
        onSuccess(parseInt(paths.distance)
          , parseInt(paths.duration), points);
      }catch (e) {
        console.error("callback error: " + e.message);
      }
    })
    .catch((error)=>{
      console.error(JSON.stringify(error));
      onFailed();
    });
}

function getTransitRoute(fromLng, fromLat, toLng, toLat,currentCity,cityd
	, onSuccess, onFailed=function () {}) {
	let amap = new AMapWX({key:'79b04b389200e02f64488b8bcf3af0d6'});
	let normal = new Promise((resolve, reject)=>{
		amap.getTransitRoute({
			origin: fromLng.toString() + "," + fromLat.toString(),
			destination: toLng.toString() + "," + toLat.toString(),
			city:currentCity,
			cityd:cityd,
			strategy:'LEAST_TIME',
			success(data) {
			  console.warn(data);
				if(data.transits && data.transits.length > 0){
					resolve(data.transits);
					return;
				}
				reject(new AddError("getTransitRoute result error"));
			},
			fail(error) {
				reject(new AddError(JSON.stringify(error)));
			}
		});
	});
	Promise.race([
		normal,
		new Promise((resolve, reject)=>{
			setTimeout(function () {
				reject(new AddError("getTransitRoute timeout"));
			}, 10*1000);
		})
	])
		.then((transits)=> {
	    console.warn(transits);
			transits = transits.sort(commonMethod.compare('duration',false));
			let routeArr = [];
			let timeSegmentsLessArr = transits[0].segments;
			for ( let i = 0;i<timeSegmentsLessArr.length;i++ ) {
			  let busLines = timeSegmentsLessArr[i].bus.buslines;
			  let entrance = timeSegmentsLessArr[i].entrance.name || '';
			  let exit = timeSegmentsLessArr[i].exit.name || '';
			  if ( busLines.length > 0 ) {
			    for ( let j = 0;j<busLines.length; j++ ) {
						routeArr.push(busLines[j].name+'(在'+busLines[j].departure_stop.name+entrance+'上车，到'+
							busLines[j].arrival_stop.name+exit+'下车'+')' );
          }
        }
      }
			try {
				onSuccess(routeArr.join(','));
			}catch (e) {
				console.error("callback error: " + e.message);
			}
		})
		.catch((error)=>{
			console.error(JSON.stringify(error));
			onFailed();
		});
}

module.exports = {
  Const:{
    invalidLng: invalidLng,
    invalidLat: invalidLat
  },
  getGPS: getGPS, // 请使用getRealTimeGps， 此接口后期会去掉
  getLocalGps: getLocalGps,
  getRealTimeGps: getRealTimeGps,
  getRegeo: getRegeo,
  getAdcodeHere: getAdcodeHere,
  getWalkingRoute: getWalkingRoute,
	getTransitRoute:getTransitRoute
};

// getRealTimeGps((lng, lat)=>{
//   console.log("address:" + lng.toString() + ", " + lat.toString());
// });
//
// getAdcodeHere((lng, lat, adcode, city)=>{
//   console.log("address:" + lng.toString() + ", " + lat.toString()+ ", "  + adcode + ", " + city);
// });
//
// getRegeo(104.066541, 30.572269, (address)=>{
//   console.log(address);
// });
//
// getWalkingRoute(104.066541, 30.572269, 104.068541, 30.572269
//   , (distance, duration, points)=>{
//     console.log(distance);
//     console.log(duration);
//     console.log(points);
//   });

