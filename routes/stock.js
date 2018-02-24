const express = require('express');
const router = express.Router();
const alpha = require('alphavantage')({ key: '2LSUS7X2UPKUPU2A' });
// let client = require("redis").createClient(process.env.REDIS_URL);

var io = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });


const symbol='MSFT'
const interval='60min'
const datatype='json'
const outputsize = 'compact'
// Get daily price of stock.
router.get('/daily',function(req,res,next){
  // Simple examples
  alpha.data.daily(symbol, outputsize, datatype, interval)
    .then(data => {
    // console.log(data);
    // client.publish("stock:daily", data);
    io.emit('time', data["Meta Data"]["1. Information"]);
    res.send(data);
  });
});



module.exports = router;
