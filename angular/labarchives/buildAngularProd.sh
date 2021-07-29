#! /bin/sh
git clone -b uts "https://github.com/uts-eresearch/redbox-portal.git"
node_modules/.bin/ng build --prod --build-optimizer --output-hashing=none
