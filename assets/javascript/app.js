//function to render main screen
function renderMain() {
    //render title
    var titleDiv = $('<div>').addClass('mx-auto mt-4').attr('id', 'title').text('Wait It Out');
    $('#title-row').append(titleDiv);
    //render category icons
    for (var i = 0; i < 3; i++) {
        var cats = ['Food', 'Shopping', 'Entertainment'];
        var srcs = ['assets/Images/food_icon.png', 'assets/Images/cart.png', 'assets/Images/masks2.png'];
        //create row div and img, and append img to row and row to #main
        var row = $('<div>').addClass('row').attr('id', 'row' + i);
        //append img to row
        var image = $('<img>').addClass('mx-auto mt-5  icon hvr-pulse-grow').attr({'id': cats[i], 'src': srcs[i]});
        row.append(image);
        $('#main').append(row);
    }
}

renderMain();

function renderHomeButton() {
    $('#map').css("display", "none");
    var homeBtn = $('<img>').attr('src', 'assets/Images/home.png');
    homeBtn.addClass('home-btn');
    homeBtn.css({
        "width": "20%",
        "display": "block",
        "margin": "50px auto",
    });
    $('#home').append(homeBtn)
}

$(document).on('click', '.home-btn', function () {
    $('#main').empty();
    $('#title-row').empty();
    $('#map').empty();
    $('#home').empty();
    renderMain();
});

var userSelection = [];

//click on icon to show subcategories
$(document).on('click', '.icon', function () {
    renderHomeButton();
    //changes text at top of screen
    $('#title').text("I'm in the mood for...").css("font-size", "8vw");
    // var to store subcategories
    var subCategories = {
        Food: ['Italian', 'Thai', 'American'],
        Shopping: ['Groceries', 'General', 'Mall'],
        Entertainment: ['Movie', 'Bar', 'Yoga']
    };
    var clickedIcon = $(this).attr('id');
    userSelection.typeSelection = clickedIcon;
    console.log(userSelection);
    //clear icons
    $('#main').empty();
    //display 3 sub-categories
    for (let i = 0; i < 3; i++) {
        var subText = subCategories[clickedIcon][i];
        var row = $('<div>').addClass('row');
        // var subDiv = $('<div>').text(subText).addClass('sub mx-auto mt-5').attr('id', subText);
        var subDiv = $('<div>').text(subText).addClass('mx-auto mt-4 sub option').attr('id', subText);
        $('#main').append(row);
        row.append(subDiv);
        subDiv.click(function () {
            userSelection.subCategorySelection = $(this).attr('id');
            console.log(userSelection);
            googleApiCall();

        })
    }

});

function openModal() {

    var modal = document.getElementById('simpleModal');

    modal.style.display = "block";

    $('#closeBtn').on('click', function () {
        modal.style.display = "none";
    });

    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
}

// Log location Data
var userLocation = {};

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        openModal()
    }
}

function showPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    userLocation.userLatitude = latitude;
    userLocation.userLongitude = longitude;
}

getLocation();

var destination;

function googleApiCall() {
    console.log('making api call');
    var url = 'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?';
    var apiKey = 'AIzaSyCUM6ziq10bpobC1rqrO3O9LGJwgzUTJEA';
    var combinedLocation = userLocation.userLatitude + "," + userLocation.userLongitude;
    console.log('Returned Lat and Long is ' + combinedLocation);
    $.ajax(url, {
        data: {
            'key': apiKey,
            'location': combinedLocation,
            // 'radius': 10000,
            'keyword': userSelection.subCategorySelection,
            'name': userSelection.typeSelection,
            'opennow': true,
            'rankby': 'distance',
        }

    }).then(function (response) {
        console.log('API call received');
        console.log(JSON.parse(JSON.stringify(response)));
        $('#main').empty();
        $('#title').text("Take Me To...").css("font-size", "12vw");

        var responseLength = '';

        function parseReturnedResults() {
            if (response.results.length < 3) {
                responseLength = response.results.length.toString();
                return responseLength;
            } else {
                responseLength = '3';
                return responseLength;
            }
        }

        parseReturnedResults();
        console.log(response.results.length +' results returned');

        for (i = 0; i < Number(responseLength); i++) {
            var result = $('<div>');
            result.attr('placeId', response.results[i].place_id);
            result.attr('latitude', response.results[i].geometry.location.lat);
            result.attr('longitude', response.results[i].geometry.location.lng);
            result.addClass('option mx-auto mt-4');
            const name = $('<div>').addClass('nameDiv');
            var locationInformation = $('<div>').addClass('localeInfo');
            name.append(response.results[i].name);
            locationInformation.append(response.results[i].vicinity);
            result.append(name);
            result.append(locationInformation);
            var row = $('<div>').addClass('row');
            row.append(result);
            result.click(function () {
                $('#map').css("display", "block");
                $('#main').empty();
                $('#title').text(name[0].innerHTML).css("font-size", "12vw");
                console.log("working");
                destination = $(this).attr('placeid');
                console.log(destination);
                googleMap();
            });

            $('#main').append(row);
        }
    })
}


function googleMap() {
    var map;

    //    starting directions services
    var markerArray = [];

    var directionsDisplay = new google.maps.DirectionsRenderer();

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: userLocation.userLatitude, lng: userLocation.userLongitude},
        zoom: 15
    });

    var directionsService = new google.maps.DirectionsService();
    var stepDisplay = new google.maps.InfoWindow;
    var driving = google.maps.DirectionsTravelMode.DRIVING;
    //    updates the content of the map
    infoWindow = new google.maps.InfoWindow;

    //    will display direcitons on map


    function calculateRoute() {
        // console.log(moment().format('LTS'));
        // var currentTime = moment().format('LTS');
        // input locations here ( need to check why it won get the coordinates)
        var request = {
            origin: {lat: userLocation.userLatitude, lng: userLocation.userLongitude},
            destination: {placeId: destination},
            travelMode: driving,
            // drivingOptions: {
            // departureTime: new Date(Date.now()),
            // trafficModel: 'pessimistic'
            // }
        };

        // displays the locations object in map
        directionsService.route(request, function (result, status) {
            console.log(result, status);
            if (status === "OK") {
                document.getElementById('warnings-panel').innerHTML = '<b>' + result.routes[0].warnings + '</b>';
                directionsDisplay.setDirections(result);
                showSteps(result, markerArray, stepDisplay, map);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        })
    }

    directionsDisplay.setMap(map);
    // calls the direction to the map
    calculateRoute();

    function showSteps(directionResult, markerArray, stepDisplay, map) {
        // For each step, place a marker, and add the text to the marker's infowindow.
        // Also attach the marker to an array so we can keep track of it and remove it
        // when calculating new routes.
        var myRoute = directionResult.routes[0].legs[0];
        for (var i = 0; i < myRoute.steps.length; i++) {

            var marker = markerArray[i] = markerArray[i] || new google.maps.Marker;
            marker.setMap(map);
            marker.setPosition(myRoute.steps[i].start_location);
            attachInstructionText(
                stepDisplay, marker, myRoute.steps[i].instructions, map);
        }
        console.log(myRoute.steps[0].instructions)
    }

    function attachInstructionText(stepDisplay, marker, text, map) {
        google.maps.event.addListener(marker, 'click', function () {
            // Open an info window when the marker is clicked on, containing the text
            // of the step.
            stepDisplay.setContent(text);
            stepDisplay.open(map, marker);
        });
    }
}


