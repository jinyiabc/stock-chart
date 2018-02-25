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

// Initialize Chart configuration.
var config = {
  type: 'line',
  data: {
    labels: [],
    datasets: []
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
  $.get('http://localhost:3000/stock/daily',function(data){
    console.log(data);
    var length = data.length;
    var colorNames = Object.keys(window.chartColors);

    for ( var i=0; i< length; i++){
      var colorName = colorNames[i];
      var newColor = window.chartColors[colorName];
      config.data.datasets[i] = {
                                  label: data[i]['symbol'],  // eg. MSFT
                                  backgroundColor: newColor,
                                  borderColor: newColor,
                                  data: data[i]['ClosePrices'],
                                  fill: false,
                                };
     $('#stockList').append($('<button>')
                    .text(data[i]['symbol']));

    }
    config.data.labels = data[0]['labels'];
    console.log('Loading from DB:',config);
    var ctx = document.getElementById('canvas').getContext('2d');
    window.newLine = new Chart(ctx, config);

  });
};

time.on('time', function (data) {
  // Emit acknowledgement
  time.emit('ack', data ,function(response){
    console.log(response);
  });

  var ClosePrices = [];
  var labels = [];
  for (key in data['data']){
    ClosePrices.push(+data['data'][`${key}`]['close']);
    labels.push(key.slice(0,10));
  }
  var newDataset = {
    label: data['meta']['symbol'],  // eg. MSFT
    backgroundColor: window.chartColors.red,
    borderColor: window.chartColors.red,
    data: ClosePrices,
    fill: false,
  };
// new symbol => close prices & labels
  config.data.datasets = (config.data.datasets).concat(newDataset);
  config.data.labels = labels;
  // console.log(config.data.labels);
  // var ctx = document.getElementById('canvas').getContext('2d');
  // new Chart(ctx, config);
  console.log(typeof window.myLine);
  if (typeof window.myLine != "undefined") {
    window.myLine.update();
    } else {
      var ctx = document.getElementById('canvas').getContext('2d');
      window.newLine = new Chart(ctx, config);
    }


  time.emit('addstock',{"symbol":data['meta']['symbol']
                        ,"labels":labels
                        ,"ClosePrices": ClosePrices });

});

// $('#times').append($('<li>').text(data));


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


});
