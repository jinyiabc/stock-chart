$(function () {

// Connected to custom namespace.
  var chat = io('/chat');
  var typing = io('/chat');
  var time = io();
  // var subscriber = require("redis").createClient(process.env.REDIS_URL)

  $('#message').keypress(function(){
    typing.emit('typing', handle.value);
  });
  $('#send').click(function(){
    // Now that we are connected let's send our test call with callback
    chat.emit('chat', {
        message: message.value,
        handle: handle.value
    }, function(response){
      console.log(response);
    });
    message.value = "";
  })


  // Listen for events
  chat.on('chat', function(data){
      feedback.innerHTML = '';
      output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
  });

  typing.on('typing', function(data){
      feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
  });

  time.on('time', function (data) {
    // console.log('time', typeof(data), data);
    $('#times').append($('<li>').text(data));
    time.emit('ack', data ,function(response){
      console.log(response);
    });
    // console.log(data);

    var ClosePrices = [];
    var labels = [];
    for (key in data){
      ClosePrices.push([key,+data[`${key}`]['close']]);
      labels.push([key]);
    }
    // console.log(ClosePrices);
    // var updated = data['meta']['updated'];  // 2018-02-23
    // console.log(date['data']['2018-02-16T00:00:00.000Z']['close']);
    // function dateKey(date,index){     //date => //2018-02-23
    //   var currentDate = new Date(date);
    //   var targetDate = new Date(currentDate); //
    //   targetDate.setDate(currentDate.getDate()-index);
    //   // console.log(targetDate);   // Thu Feb 22 2018 08:00:00 GMT+0800 (CST)
    //   var date = targetDate.getDate();
    //   var year = targetDate.getFullYear();
    //   var month = (targetDate.getMonth()+1)% 12;
    //   if(month < 10){
    //     month = '0'+`${month}`;
    //   } else {
    //     month = `${month}`;
    //   }
    //   return `${year}`+'-'+`${month}`+'-'+`${date}`+'T00:00:00.000Z';
    // }

    config.data.datasets.forEach(function(dataset) {
      dataset.data = dataset.data.map(function(item,index) {
        return ClosePrices[index][1];
      });
    });
    // console.log(data['2018-02-23T00:00:00.000Z']);
    // console.log(data['2018-02-16T00:00:00.000Z']);

    // config.data.labels = labels.slice(7)
    // console.log(config.data.labels);    // ok!

    config.data.labels = config.data.labels.map(function(item,index){
      console.log(ClosePrices[index][0]);
      return ClosePrices[index][0].slice(0,10);
    });
    // console.log(config.data.labels);

    window.myLine.update();
  });



var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var config = {
  type: 'line',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'My First dataset',
      backgroundColor: window.chartColors.red,
      borderColor: window.chartColors.red,
      data: [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor()
      ],
      fill: false,
    }, {
      label: 'My Second dataset',
      fill: false,
      backgroundColor: window.chartColors.blue,
      borderColor: window.chartColors.blue,
      data: [
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor(),
        randomScalingFactor()
      ],
    }]
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'Chart.js Line Chart'
    },
    tooltips: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'nearest',
      intersect: true
    },
    scales: {
      xAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Month'
        }
      }],
      yAxes: [{
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Value'
        }
      }]
    }
  }
};
window.onload = function() {
  var ctx = document.getElementById('canvas').getContext('2d');
  window.myLine = new Chart(ctx, config);
};
document.getElementById('GETDATA').addEventListener('click', function() {
  config.data.datasets.forEach(function(dataset) {
    dataset.data = dataset.data.map(function() {
      return randomScalingFactor();
    });
  });
  window.myLine.update();
});
var colorNames = Object.keys(window.chartColors);
document.getElementById('addDataset').addEventListener('click', function() {
  var colorName = colorNames[config.data.datasets.length % colorNames.length];
  var newColor = window.chartColors[colorName];
  var newDataset = {
    label: 'Dataset ' + config.data.datasets.length,
    backgroundColor: newColor,
    borderColor: newColor,
    data: [],
    fill: false
  };
  for (var index = 0; index < config.data.labels.length; ++index) {
    newDataset.data.push(randomScalingFactor());
  }
  config.data.datasets.push(newDataset);
  window.myLine.update();
});
document.getElementById('addData').addEventListener('click', function() {
  if (config.data.datasets.length > 0) {
    var month = MONTHS[config.data.labels.length % MONTHS.length];
    config.data.labels.push(month);
    config.data.datasets.forEach(function(dataset) {
      dataset.data.push(randomScalingFactor());
    });
    window.myLine.update();
  }
});
document.getElementById('removeDataset').addEventListener('click', function() {
  config.data.datasets.splice(0, 1);
  window.myLine.update();
});
document.getElementById('removeData').addEventListener('click', function() {
  config.data.labels.splice(-1, 1); // remove the label first
  config.data.datasets.forEach(function(dataset) {
    dataset.data.pop();
  });
  window.myLine.update();
});

  // // Sandbox
  // socket.on('news',function(data){
  //   console.log(data);
  //   socket.emit('my other event',{my:'data'});
  // });




});
