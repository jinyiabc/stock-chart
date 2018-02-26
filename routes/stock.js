const express = require('express');
const router = express.Router();
const Stock = require('../models/stocks')
const alpha = require('alphavantage')({ key: '2LSUS7X2UPKUPU2A' });
// let client = require("redis").createClient(process.env.REDIS_URL);

var io = require('socket.io-emitter')({ host: '127.0.0.1', port: 6379 });


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
    io.emit('dataInitiation',data);
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
