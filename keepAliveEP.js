const http = require('http');

module.exports = http
  .createServer((request, response) => {
    console.log('kseeping alive');
    response.end('Hello Node.js Server!');
  })
  .listen(80, err => {
    if (err) {
      console.log(`Server didn't started`, err);
    }
    console.log(`server is listening on 3000`);
  });
