const express = require('express');
const router = express.Router();
const User = require('../models/users');

// Get a list of polls from the db
router.get('/:userId/polls',function(req,res,next){
  const query = {'github.username':req.params.userId};
  User.find(query).then(function(results){
    res.send(results);
  });
});

// Get single poll from users
router.get('/:userId/polls/poll',function(req,res,next){
  const query = {'github.username':req.params.userId };

  console.log(req.query.index);   // parse from clent.

  User.find(query).then(function(results){
    res.send(results);
  });
});

// Get all polls from all users
router.get('/polls',function(req,res,next){
  const query = {};

  User.find(query).then(function(results){
    console.log(results);
    res.send(results);
  });
});


// Add a new poll to the db
router.post('/:userId/polls',function(req,res,next){
  const query = {'github.username':req.params.userId};
//   req.body = {
// 	              "title":"Thor or Camption America?",
// 	              "options":["Thor","Camption America","Iron Man"]
//              }
  const update = {polls: {
                        $each:[ req.body ],
                        $sort: { score: -1 }
                      }
                 };
  User.findOneAndUpdate(query,{$push:update},{upsert: true}).then(function(){   //upsert: bool - creates the object if it doesn't exist. defaults to false.

    User.findOne(query).then(function(user){
      res.send(user);
    })
  }).catch(next);

});

// Update a poll in the db

// db.collection.update({ d : 2014001 , m :123456789},
//                       {$pull : { "topups.data" : {"val":NumberLong(200)} } } )
router.put('/:userId/polls',function(req,res,next){
  var ip = (req.headers['x-forwarded-for'] ||
       req.connection.remoteAddress ||
       req.socket.remoteAddress ||
       req.connection.socket.remoteAddress).split(",")[0];
  console.log('ip',ip);

  const query_ip = { 'github.username':req.params.userId,
                     'polls':{
                              $all:[
                                    {"$elemMatch": { "ip":ip, 'title': req.body.title}}
                                   ]
                            }
                   }


  User.findOne(query_ip).then(function(result){
    if(result){
      console.log('You have already voted for this poll. You are allowed only once.');
      res.send('match')
    }
    else {
     // Vote since the uer ip does not exist in polls.
      const query = { 'github.username':req.params.userId,
                      'polls.title':req.body.title}
      const update = {
                      $set:{'polls.$.options':req.body.options},
                      $push:{'polls.$.ip':ip}
                    };
      User.updateOne(query,update,{upsert: true}).then(function(){   //upsert: bool - creates the object if it doesn't exist. defaults to false.

        User.findOne(query).then(function(user){
          res.send(user);
        })
      }).catch(next);

    }
  });

});

// Delete a poll from the db
router.delete('/:userId/polls',function(req,res,next){
  console.log(req.query.title);
  const query = { 'github.username':req.params.userId}
  const update = {
                  $pull:{'polls':{"title":req.query.title}}
                };


  User.updateOne(query,update,{upsert: true}).then(function(){   //upsert: bool - creates the object if it doesn't exist. defaults to false.

    User.findOne(query).then(function(user){
      res.send(user);
    })
  }).catch(next);
});

// Delete an option form the poll
router.delete('/:userId/polls/poll',function(req,res,next){
  const query = { 'github.username':req.params.userId}
  const update = {
                  $pull:{'polls':{"title":req.body.title}}
                };


  User.updateOne(query,update,{upsert: true}).then(function(){   //upsert: bool - creates the object if it doesn't exist. defaults to false.

    User.findOne(query).then(function(user){
      res.send(user);
    })
  }).catch(next);
});

module.exports = router;
