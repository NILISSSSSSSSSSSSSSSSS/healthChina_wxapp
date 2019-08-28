#!/usr/bin/env bash
chmod +x config.sh
if [ $# -ne 1 ] || ( [ "x$1" != 'xtest' ] && [ "x$1" != 'xpro' ]);then
  echo "Usage : $0 test/pro" >&2
  exit 1
fi

if [ "x$1" == 'xtest' ] ;then
  cp utils/config.test.js utils/config.js
else
  cp utils/config.pro.js utils/config.js
fi
