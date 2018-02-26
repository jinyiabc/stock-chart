$(function () {

// Connected to custom namespace.
  var chat = io('/chat');
  var typing = io('/chat');
  var time = io();
  // var subscriber = require("redis").createClient(process.env.REDIS_URL)

  // $('#message').keypress(function(){
  //   typing.emit('typing', handle.value);
  // });
  // $('#send').click(function(){
  //   // Now that we are connected let's send our test call with callback
  //   chat.emit('chat', {
  //       message: message.value,
  //       handle: handle.value
  //   }, function(response){
  //     console.log(response);
  //   });
  //   message.value = "";
  // })


  // Listen for events
  // chat.on('chat', function(data){
  //     feedback.innerHTML = '';
  //     output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
  // });

  typing.on('typing', function(data){
      feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
  });

  time.on('getdata',function(data){
    var symbol = data;
    var datasets = window.newLine.data.datasets.filter(dataset => dataset.label != symbol);
    window.newLine.data.datasets = datasets;
    window.newLine.update();

    // var elements = '<li class="list-group-item list-group-item-success">'+`${symbol}`+
    //                  `<a href="#" id="${symbol}" class="btn">` +
    //                      '<span class="glyphicon glyphicon-remove">' + '</span>' +
    //                  '</a>'+
    //                '</li>';
    // // $('#stockList').remove($(elements));
    // $('#stockList').click(function(){
    //   $(elements).remove();
    // })

{/* <li class="list-group-item list-group-item-success">AAPL<a href="#" id="AAPL" class="btn"><span class="glyphicon glyphicon-remove"></span></a></li> */}

  });

// Receive OUTSOURCE from calling /stock/daily/:symbol
// Then emit to server.
// Then server emit to all clients.
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

    var colorNames = Object.keys(window.chartColors);
    var colorName = colorNames[config.data.datasets.length % colorNames.length];
    var newColor = window.chartColors[colorName];

    var newDataset = {
      label: data['meta']['symbol'].toUpperCase(),  // eg. MSFT
      backgroundColor: newColor,
      borderColor: newColor,
      data: ClosePrices,
      fill: false,
    };
  // new symbol => close prices & labels
    config.data.datasets = (config.data.datasets).concat(newDataset);
    config.data.labels = labels;
    // console.log(config.data.labels);
    // var ctx = document.getElementById('canvas').getContext('2d');
    // new Chart(ctx, config);
    console.log(typeof window.newLine);
    if (typeof window.newLine != "undefined") {
      window.newLine.data.datasets = config.data.datasets;
      window.newLine.update();

      } else {
        var ctx = document.getElementById('canvas').getContext('2d');
       window.newLine =  new Chart(ctx, config);
      // getData();
      }


    time.emit('addstock',{"symbol":data['meta']['symbol']
                          ,"labels":labels
                          ,"ClosePrices": ClosePrices });

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
      text: 'Stock Chart-FCC'
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
          labelString: 'Stocks'
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
window.onload = getData();

function getData() {
  $.get('http://localhost:3000/stock/daily',function(data){
  //   console.log(data);



    var length = data.length;
    var colorNames = Object.keys(window.chartColors);

    for ( var i=0; i< length; i++){
      var colorName = colorNames[i];
      var newColor = window.chartColors[colorName];
      config.data.datasets[i] = {
                                  label: data[i]['symbol'].toUpperCase(),  // eg. MSFT
                                  backgroundColor: newColor,
                                  borderColor: newColor,
                                  data: data[i]['ClosePrices'],
                                  fill: false,
                                };
     var elements = '<li class="list-group-item list-group-item-success">'+`${data[i]['symbol']}`+
                      `<a href="#" id="${data[i]['symbol']}" class="btn">` +
                          '<span class="glyphicon glyphicon-remove">' + '</span>' +
                      '</a>'+
                    '</li>';
     $('#stockList').append($(elements));


    }
    config.data.labels = data[0]['labels'];
    console.log('Loading from DB:',config);
    var ctx = document.getElementById('canvas').getContext('2d');
    window.newLine = new Chart(ctx, config);
    console.log(window.newLine);

  });
};

// Add new stock to Socket
$('#addDataset').on('click', function() {
  console.log('Button was clicked.');
if($('#newStock').val()){
  var symbol = $('#newStock').val().toUpperCase();
  console.log(symbol);
  $.get(`http://localhost:3000/stock/daily/${symbol}`,function(data){
     console.log('Add new stock:',data['meta']['symbol']);

     // API emit newdata to all browsers.


  });
};
});



// Remove specific stock through socket.io
$('.list-group').on('click','span', function(event) {
    var spanElement = event.target;
    var symbol = $(spanElement).parent().attr("id");

    var datasets = window.newLine.data.datasets.filter(dataset => dataset.label != symbol);
    window.newLine.data.datasets = datasets;
    console.log(window.newLine.data.datasets);

    window.newLine.update();

    // var elements = '<li class="list-group-item list-group-item-success">'+`${symbol}`+
    //                  `<a href="#" id="${symbol}" class="btn">` +
    //                      '<span class="glyphicon glyphicon-remove">' + '</span>' +
    //                  '</a>'+
    //                '</li>';
    // $(elements,'#stockList').remove();


    time.emit('delete', symbol, function(response){
      console.log(response);
    });

//Delete from MongoDB.
    $.ajax({
        url: `http://localhost:3000/stock/daily/${symbol}`,
        type: 'DELETE',
        success: function(){
           console.log('Delete stock:',symbol,'from DB');
           // getData();
        }
    });
});






});
