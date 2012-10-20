#!/bin/sh

rm -f script.js
cat *.js | yui-compressor --type js -o script.js

rm -f style.css
cat *.css | yui-compressor --type css -o style.css

