// SV: https://developers.google.com/maps/documentation/javascript/streetview#StreetViewMapUsage

//TODO - add button to take you back to the starting point

let map;
let panorama;
let marker;
let attempts = 0;
let score=0;
let correct_marker;
let round_count = 1;

// TODO: snapshot to valid location THEN update start_loication.
let roundLocation;

const DEFAULT_LOCATION = {lat: 38.56, lng: -121.503 };

const GLOBE_RADIUS = 3958; // Radius of the Earth in miles

function calculateDistance(latLng1, latLng2){
        var rlat1 = latLng1.lat() * (Math.PI/180); // Convert degrees to radians
        var rlat2 = latLng2.lat() * (Math.PI/180); // Convert degrees to radians
        var difflat = rlat2-rlat1; // Radian difference (latitudes)
        var difflon = (latLng2.lng()-latLng1.lng()) * (Math.PI/180); // Radian difference (longitudes)
  
        var d = 2 * GLOBE_RADIUS * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
        return d;
}


function handleSubmitClick(){
    //TODO: get their current map location

    distance = calculateDistance(marker.getPosition(), roundLocation.latLng)
    if(distance<10){
        PrettyDistance = (distance).toFixed(2);
    } else{
        PrettyDistance = Math.round(distance);

    }
    $('#Distance').text(PrettyDistance)
    console.log('distance', distance)
    score += calculateScore(distance)
    console.log('score', score)

    $('#score').text(score)
    $('#next-round').show()
    $('#submit').hide()

    correct_marker = new google.maps.Marker({
        position: roundLocation.latLng,
        map: map,
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
          }
      });

    var bounds = new google.maps.LatLngBounds();

    bounds.extend(roundLocation.latLng);
    bounds.extend(marker.getPosition());

    map.fitBounds(bounds);

    // TODO: generateNewLocation
    // generateNewLocation()
}

google.maps.event.trigger(map, "resize");

function generateNewLocation(){
    //todoBroadway, New York

    var streetViewService = new google.maps.StreetViewService();
    // var STREETVIEW_MAX_DISTANCE = 1000000;
    var STREETVIEW_MAX_DISTANCE = 100; //sacramento

    // Normal
    // var latLng = new google.maps.LatLng(
    //     (Math.random()*125) - 50,  // 75 to -50 is good range
    //     (Math.random()*360) - 180);

    // Sacramento
    var latLng = new google.maps.LatLng(
        38.53 + (Math.random()*0.06), 
        -121.503 + (Math.random() * 0.05));

    console.log('latLng', latLng.lat(), latLng.lng())

    // TODO; make rough polygons for oceans, then retry if inside them.
    
    // TODO

    // google.maps.StreetViewSource.OUTDOOR
    // TODO: use api https://developers.google.com/maps/documentation/streetview/intro
    function panoHandler(streetViewPanoramaData, status) {
        if (status === google.maps.StreetViewStatus.OK) {
            // ok
            console.log('ok', streetViewPanoramaData)
            roundLocation = streetViewPanoramaData.location;
            panorama.setPosition(roundLocation.latLng)
            attempts=0;
        } else {
            // no street view available in this range, or some error occurred
            console.log('bad', status)
            attempts++;
            if (attempts<5 ){
                generateNewLocation();
            }
        }
    }

    streetViewService.getPanorama({
        location: latLng,
        radius:	STREETVIEW_MAX_DISTANCE,
        source: google.maps.StreetViewSource.OUTDOOR
        }, panoHandler);

    // streetViewService.getPanoramaByLocation(latLng, STREETVIEW_MAX_DISTANCE, panoHandler);
    // https://stackoverflow.com/questions/2675032/how-to-check-if-google-street-view-available-and-display-message/7458392#7458392
}

function calculateScore(distance){
    return Math.round(100 * (GLOBE_RADIUS / (distance + 1)))
}

function initialize() {

    $('#next-round').click(()=>{
        correct_marker.setMap(null);
        marker.setPosition(DEFAULT_LOCATION);
        round_count++;
        $('#round').text(round_count);
        generateNewLocation();
        // map.setZoom(1);

        map.setCenter(DEFAULT_LOCATION);
        map.setZoom(12);

        $('#submit').show();
        $('#next-round').hide();
    });

    $('#reset-pano').click(()=>{
        panorama.setPosition(roundLocation.latLng)
    });

    $('#grow_map').click(()=>{
        $('#map').width(400);
        $('#map').height(300);
        google.maps.event.trigger(map, "resize");
    });
    $('#shrink_map').click(()=>{
        $('#map').height(30);
        $('#map').width(20);
        google.maps.event.trigger(map, "resize");
    });

    $('#next-round').hide();

    // Makes map and street view
    map = new google.maps.Map(document.getElementById('map'), {
        center: DEFAULT_LOCATION,
    //   zoom: 1
        zoom: 12
    });

    marker = new google.maps.Marker({
        position: DEFAULT_LOCATION,
        map: map,
      });

    //TODO: add clicking to map so you can add a marker.
    map.addListener('click', function(e) {
        console.log('click ', e.latLng.lat(), e.latLng.lng())
        // map.setZoom(8);
        // map.setCenter(marker.getPosition());
        marker.setPosition(e.latLng);
      });

    //# TODO: turnoff streeet name overlays
    panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), {
            addressControl: false,
            streetViewControl: true,
            // showRoadLabels: false,
          position: {lat:0,lng:0},
          pov: {
            heading: 34,
            pitch: 10
          }
        });

    $('#submit').click(handleSubmitClick)

    generateNewLocation();
  }

