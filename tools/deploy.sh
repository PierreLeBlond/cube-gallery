ssh ssh://ncyujthp@node104-eu.n0c.com:5022 'rm -rf ./app/cube-gallery/*'
npm run build && scp -r -P 5022 ./dist/* ncyujthp@node104-eu.n0c.com:./app/cube-gallery/
