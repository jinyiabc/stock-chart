$(function () {

  var time = io();

// Agent users update after delete single stock from other user.
  time.on('getdata',function(data){
    var symbol = data;
    var datasets = window.newLine.data.datasets.filter(dataset => dataset.label != symbol);
    window.newLine.data.datasets = datasets;
    window.newLine.update();

    var labels = window.newLine.data.datasets.map(function(dataset){
      return dataset.label;
    })

    $('#stockList').empty();
    var length = labels.length;
    for ( var i=0; i< length; i++){
     var elements = '<li class="list-group-item list-group-item-success">'+`${labels[i]}`+
                      `<a href="#" id="${labels[i]}" class="btn">` +
                          '<span class="glyphicon glyphicon-remove">' + '</span>' +
                      '</a>'+
                    '</li>';
     $('#stockList').append($(elements));


    }
  });

// Receive new data from Alpha
// Then emit to server.
// Then server SAVE to DB.
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

    console.log(typeof window.newLine);
    if (typeof window.newLine != "undefined") {
      window.newLine.data.datasets = config.data.datasets;
      window.newLine.update();

      } else {
        var ctx = document.getElementById('canvas').getContext('2d');
       window.newLine =  new Chart(ctx, config);
      // getData();
      }

      var elements = '<li class="list-group-item list-group-item-success">'+`${newDataset.label}`+
                       `<a href="#" id="${newDataset.label}" class="btn">` +
                           '<span class="glyphicon glyphicon-remove">' + '</span>' +
                       '</a>'+
                     '</li>';
      $('#stockList').append($(elements));
   // Emit to server then save to MongoDB
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

// Every agent user will initiate the Chart.
function getData() {
  $.get('http://localhost:3000/stock/daily',function(data){
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
// Clear the input area.
   $('#newStock').val('') ;
// Request from API endpoint where 'broadcast' to all agent users.
  $.get(`http://localhost:3000/stock/daily/${symbol}`,function(data){
     console.log('Add new stock:',data['meta']['symbol']);
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
    $('#stockList').empty();
    var length = datasets.length;
    for ( var i=0; i< length; i++){
     var elements = '<li class="list-group-item list-group-item-success">'+`${datasets[i]['label']}`+
                      `<a href="#" id="${datasets[i]['label']}" class="btn">` +
                          '<span class="glyphicon glyphicon-remove">' + '</span>' +
                      '</a>'+
                    '</li>';
     $('#stockList').append($(elements));


    }
// Emit to server then server emit to all agent users.
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
