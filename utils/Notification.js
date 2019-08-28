/**
 * Created by xpwu on 16/5/16.
 */


  /**
   *
   * @type {{name:[{o:object,c:string}]}}
   */
  let names = Object.create(null);
  let NotificationCenter = {
    /**
     *
     * @param {object}observer
     * @param {string}callback --- function(name, userInfo)
     * @param {string}name
     */
    addObserver: function(observer, callback, name) {
      if (names[name] === undefined) {
        names[name] = [];
        names[name+'_cnt'] = 0;
      }

      var pos = names[name].length;
      for (var i = 0; i < names[name].length; ++i) {
        if (i in names[name] && names[name][i] === undefined) {
          pos = i;
          continue;
        }
        if (i in names[name] && names[name][i] != undefined) {
          if (names[name][i]['o'] === observer) {
            names[name][i]['c'] = callback;
            return;
          }
        }
      }
      names[name][pos] = {'o':observer, 'c':callback};
      names[name+'_cnt'] += 1;
    },

    removeObserver: function(observer, name) {
      if (names[name] === undefined) {
        return;
      }

      for (var i = 0; i < names[name].length; ++i) {
        if (i in names[name] && names[name][i] != undefined) {
          if (names[name][i]['o'] === observer) {
            names[name][i] = undefined;
            names[name+'_cnt'] -= 1;

            if (names[name+'_cnt'] == 0) {
              delete names[name+'_cnt'];
              delete names[name];
            }
            return;
          }
        }
      }
    },

    removeObserverAllNotification: function(observer) {
      for (var name in names) {
        if (typeof names[name] != 'object') {
          continue;
        }
        this.removeObserver(observer, name);
      }
    },

    postNotification: function(name, userInfo) {
      if (names[name] === undefined) {
        return;
      }

      for (var i = 0; i < names[name].length; ++i) {
        if (i in names[name] && names[name][i] != undefined) {
          if (typeof names[name][i]['o'] === 'object' 
								&& typeof names[name][i]['o'][names[name][i]['c']] === 'function') {
            names[name][i]['o'][names[name][i]['c']](name, userInfo);
          } else {
						names[name][i]['c'](name, userInfo);
					}
        }
      }
    },

    postNotificationAsync: function(name, userInfo) {
      setTimeout(function () {
        if (names[name] === undefined) {
          return;
        }

        for (var i = 0; i < names[name].length; ++i) {
          if (i in names[name] && names[name][i] != undefined) {
            if (typeof names[name][i]['o'] === 'object'
              && typeof names[name][i]['o'][names[name][i]['c']] === 'function') {
              names[name][i]['o'][names[name][i]['c']](name, userInfo);
            } else {
              names[name][i]['c'](name, userInfo);
            }
          }
        }
      }, 0);
    }
  };

  module.exports = NotificationCenter;



// unit test

/*

function Test1() {

}

Test1.prototype.callback = function(name, userInfo) {
  console.log("Test1 callback-->" + name + " userInfo--" + userInfo);
};

Test1.prototype.callback2 = function(name) {
  console.log("Test1 callback2-->" + name);
};

var test1 = new Test1();
NotificationCenter.addObserver(test1, 'callback', "name1");
NotificationCenter.addObserver(test1, 'callback2', "name2");

var test2 = {
  callback2: function(name) {
    console.log("test2 callback2-->" + name);
  }
};

NotificationCenter.addObserver(test2, 'callback2', "name2");

console.log('-----post name2-----');
NotificationCenter.postNotification("name2");

console.log('-----post name1-----');
NotificationCenter.postNotification("name1");

console.log('-----remove test1 post name2-----');
NotificationCenter.removeObserver(test1, 'name2');
NotificationCenter.postNotification("name2");

console.log('-----remove test2 post name2-----');
NotificationCenter.removeObserver(test2, 'name2');
NotificationCenter.postNotification("name2");

console.log('-----add test1 callback2, post name2-----');
NotificationCenter.addObserver(test1, 'callback2' ,'name2');
NotificationCenter.postNotification("name2");

console.log('-----add test2 callback2, post name2-----');
NotificationCenter.addObserver(test2, 'callback2' ,'name2');
NotificationCenter.postNotification("name2");

console.log('-----add test1 callback, post name2-----');
NotificationCenter.addObserver(test1, 'callback' ,'name2');
NotificationCenter.postNotification("name2");

console.log('-----post name1-----');
NotificationCenter.postNotification("name1", 'user3');

/*
*/


