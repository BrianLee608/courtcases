var map = AmCharts.makeChart( "chartdiv", {
  "type": "map",
  "theme": "light",
  "dataProvider": {
    "map": "usaLow",
    "areas": [
      { "id":"US-DE", "value":"3", "color":"#d22532", "callout": true },
      { "id":"US-DC", "value":"3", "color":"#d22532", "callout": true },
      { "id":"US-FL", "value":"29", "color":"#244999" },
      { "id":"US-GA", "value":"16", "color":"#d22532" },
      { "id":"US-HI", "value":"4", "color":"#d22532", "callout": true },
      { "id":"US-ID", "value":"4", "color":"#d22532" },
      { "id":"US-IL", "value":"20", "color":"#244999" },
      { "id":"US-IN", "value":"11", "color":"#244999" },
      { "id":"US-IA", "value":"6", "color":"#244999" },
      { "id":"US-KS", "value":"6", "color":"#d22532" },
      { "id":"US-KY", "value":"8", "color":"#d22532" },
      { "id":"US-LA", "value":"8", "color":"#d22532" },
      { "id":"US-ME", "value":"4", "color":"#244999" },
      { "id":"US-MD", "value":"10", "color":"#d22532", "callout": true },
      { "id":"US-MA", "value":"11", "color":"#244999", "callout": true },
      { "id":"US-MI", "value":"16", "color":"#244999" },
      { "id":"US-MN", "value":"10", "color":"#d22532" },
      { "id":"US-MS", "value":"6", "color":"#d22532" },
      { "id":"US-MO", "value":"10", "color":"#d22532" },
      { "id":"US-MT", "value":"3", "color":"#244999" },
      { "id":"US-NE", "value":"5", "color":"#d22532" },
      { "id":"US-NV", "value":"6", "color":"#244999" },
      { "id":"US-NH", "value":"4", "color":"#244999" },
      { "id":"US-NJ", "value":"14", "color":"#d22532", "callout": true },
      { "id":"US-NM", "value":"5", "color":"#d22532" },
      { "id":"US-NY", "value":"29", "color":"#244999" },
      { "id":"US-NC", "value":"15", "color":"#244999" },
      { "id":"US-ND", "value":"3", "color":"#244999" },
      { "id":"US-OH", "value":"18", "color":"#244999" },
      { "id":"US-OK", "value":"7", "color":"#d22532" },
      { "id":"US-OR", "value":"7", "color":"#d22532" },
      { "id":"US-PA", "value":"20", "color":"#d22532" },
      { "id":"US-RI", "value":"4", "color":"#244999", "callout": true },
      { "id":"US-SC", "value":"9", "color":"#d22532" },
      { "id":"US-SD", "value":"3", "color":"#d22532" },
      { "id":"US-TN", "value":"11", "color":"#244999" },
      { "id":"US-TX", "value":"38", "color":"#d22532" },
      { "id":"US-UT", "value":"6", "color":"#244999" },
      { "id":"US-VT", "value":"3", "color":"#d22532" },
      { "id":"US-VA", "value":"13", "color":"#d22532" },
      { "id":"US-WA", "value":"12", "color":"#d22532" },
      { "id":"US-WV", "value":"5", "color":"#d22532" },
      { "id":"US-WI", "value":"10", "color":"#d22532" },
      { "id":"US-WY", "value":"3", "color":"#244999" },
      { "id":"US-AK", "value":"3", "color":"#244999" },
      { "id":"US-AL", "value":"9", "color":"#d22532" },
      { "id":"US-AR", "value":"6", "color":"#244999" },
      { "id":"US-AZ", "value":"11", "color":"#d22532" },
      { "id":"US-CA", "value":"55", "color":"#244999" },
      { "id":"US-CO", "value":"9", "color":"#244999" },
      { "id":"US-CT", "value":"7", "color":"#244999", "callout": true }
    ]
  },
  "areasSettings": {
    "autoZoom": true,
    "selectedColor": "#CC0000"
  },
  "imagesSettings": {
    "labelColor": "#fff",
    "labelPosition": "middle"
  }
} );

map.addListener( "init", function() {

  // small areas
  var small = [ "US-MA", "US-RI", "US-CT", "US-NJ", "US-DE", "US-MD", "US-DC" ];

  // set up a longitude exceptions for certain areas
  var longitude = {
    "US-CA": -130,
    "US-FL": 120,
    "US-TX": 1,
    "US-LA": 40
  };

  var latitude = {
    "US-AK": -83
  };

  // Positions of callouts
  var callouts = [
    70, 60, 46, 26, 3, -20, -40, -56
  ];

  var offset = 0;

  setTimeout( function() {
    // iterate through areas and put a label over center of each
    //map.dataProvider.images = [];
    for ( x in map.dataProvider.areas ) {
      var area = map.dataProvider.areas[ x ];
      area.groupId = area.id;
      var image = new AmCharts.MapImage();
      image.title = area.title;
      image.linkToObject = area;
      image.groupId = area.id;

      // callout or regular label
      if ( area.callout ) {
        image.latitude = callouts.shift();
        image.longitude = 165;
        image.label = area.value;
        image.type = "rectangle";
        image.color = area.color;
        image.shiftX = offset;
        image.width = 22;
        image.height = 22;

        // create additional image
        var image2 = new AmCharts.MapImage();
        image2.latitude = image.latitude;
        image2.longitude = image.longitude;
        image2.label = area.id.split( '-' ).pop();
        image2.labelColor = "#000";
        image2.labelShiftX = 24;
        image2.groupId = area.id;
        map.dataProvider.images.push( image2 );
      }
      else {
        image.latitude = latitude[ area.id ] || map.getAreaCenterLatitude( area );
        image.longitude = longitude[ area.id ] || map.getAreaCenterLongitude( area );
        image.label = area.id.split( '-' ).pop() + "\n" + area.value;
      }

      map.dataProvider.images.push( image );
    }
    map.validateData();
  }, 100 )
} );
