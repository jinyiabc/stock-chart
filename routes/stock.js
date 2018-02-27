const express = require('express');
const router = express.Router();
const Stock = require('../models/stocks');
const alpha = require('alphavantage')({ key: '2LSUS7X2UPKUPU2A' });
const client = require("redis").createClient(process.env.REDIS_URL);
// const client = require('redis').createClient({
//   host: '<your host>',
//   port: 6379,
//   password: '<your password>',
// });

// var io = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });
var io = require('socket.io-emitter')(client);


// REDIS_URL=//localhost:6379
//       redis://h:p62f43f3329d1858e2528480c0cca218de97701d21f7ecf3f11e4e3644fe9d2be@ec2-54-174-198-121.compute-1.amazonaws.com:26639
// const symbol='MSFT'
const interval='60min'
const datatype='json'
const outputsize = 'compact'
// Get daily price of stock.
router.get('/daily/:symbol',function(req,res,next){
  // Simple examples
  const symbol = req.params.symbol;
  alpha.data.daily(symbol, outputsize, datatype, interval)
    .then(data => {
    // console.log(data);
    // client.publish("stock:daily", data);
    const polished = alpha.util.polish(data);
    // console.log(polished);
    io.emit('time', polished);
    res.send(polished);
  });
});

router.get('/daily',function(req,res,next){
  Stock.find({}).then(function(data){
    res.send(data);
  })
});


router.delete('/daily/:symbol',function(req,res,next){

  const query = { 'symbol':req.params.symbol}
  const update = {
                  $pull:{'symbol':req.params.symbol}
                };
  Stock.findOneAndRemove(query,).then(function(){   //upsert: bool - creates the object if it doesn't exist. defaults to false.

      console.log('Delete  in MongoDB');
      next();
  });

});


module.exports = router;
