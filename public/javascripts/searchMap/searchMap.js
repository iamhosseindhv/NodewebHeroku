/**
 * Created by iamhosseindhv on 23/06/2017.
 */
// This example displays an address form, using the autocomplete feature
// of the Google Places API to help users fill in the information.
// var parser = require('query-string');
var allowSearchByMap = false;
var autocomplete;
var map;

function CustomMarker(latlng, map, args) {
    this.latlng = latlng;
    this.args = args;
    this.setMap(map);
}

function initAutocomplete() {
    var input = document.getElementById('autocomplete');
    var options = {
        types: ['geocode'],
        //componentRestrictions: {country: 'ir'}
    };
    var styles = {
        hide: [{
            featureType: 'poi.business',
            stylers: [{visibility: 'off'}]
        },
            {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{visibility: 'off'}]
            }]
    };

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 35.6891975, lng: 51.3889735},
        zoom: 12,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        fullscreenControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            mapTypeIds: ['roadmap','satellite'],
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        }
    });
    map.setOptions({styles: styles['hide']});

    autocomplete = new google.maps.places.Autocomplete(input, options);
    //when user clicks on an item from dropwon menu
    autocomplete.addListener('place_changed', itemDidSelect);

    // Create the DIV to hold the control and call the CenterControl()
    // constructor passing in this DIV.
    var centerControlDiv = document.createElement('div');
    centerControlDiv.className = "search-by-map";
    var centerControl = new CenterControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
}


//constructor for creating custom controll for map
function CenterControl(controlDiv, map) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.marginTop = '12px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);
    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.id = "checkBox";
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '20px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Search with map';
    controlUI.appendChild(controlText);
    controlUI.addEventListener('click', allowSearchByMapHandler);
}

//decide whether do the query based on map viewport or not
var mapListener;
function allowSearchByMapHandler() {
    allowSearchByMap = !allowSearchByMap;

    if (allowSearchByMap){
        document.getElementById('checkBox').innerHTML = "Search without map";
        mapListener = map.addListener('dragend', mapBoundsDidChanged);
    } else {
        document.getElementById('checkBox').innerHTML = "Search with map";
        google.maps.event.removeListener(mapListener);
    }
}

//called when user selects an item from dropdown list
function itemDidSelect() {
    const place = autocomplete.getPlace();
    map.fitBounds(place.geometry.viewport);
    myBundle.doQueryFromSearchedAddress(place);
}


//creates new markers
var markers = [];
function createMarker(lat, lng, id, price) {
    CustomMarker.prototype = new google.maps.OverlayView();
    CustomMarker.prototype.draw = function() {
        var self = this;
        var div = this.div;
        if (!div) {
            div = this.div = document.createElement('div');
            div.innerHTML = '£' + price;
            div.classList.add('customMarker');
            if (typeof(self.args.marker_id) !== 'undefined') {
                div.dataset.marker_id = self.args.marker_id;
            }
            google.maps.event.addDomListener(div, "click", function(event) {
                google.maps.event.trigger(self, "click");
            });
            var panes = this.getPanes();
            panes.overlayImage.appendChild(div);
        }
        var point = this.getProjection().fromLatLngToDivPixel(this.latlng);
        if (point) {
            div.style.left = point.x + 'px';
            div.style.top = point.y + 'px';
        }
    };
    CustomMarker.prototype.remove = function() {
        if (this.div) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
        }
    };
    CustomMarker.prototype.getPosition = function() {
        return this.latlng;
    };

    var myLatlng = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
    var overlay = new CustomMarker(myLatlng, map, { marker_id: id});
    // Make markers clickable
    overlay.addListener('click', function (event) {
        const listing_id = this.args.marker_id;
        const listing = $('#main').find('#'+ listing_id);
        $("#main-wrap").animate({ scrollTop: listing.offset().top }, 300);
        //highlight the listing for 2 sec
    });
    markers.push(overlay);
}


function fitMarkers() {
    var bound = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        bound.extend(markers[i].getPosition());
    }
    map.fitBounds(bound);
}


//removes all the markers on the map
function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

//when result cell gets hovered
function resultCellHovered(id) {
    for (var i=0; i<markers.length; i++){
        if (markers[i].args.marker_id == id){
            markers[i].div.classList.add('customMarker-hovered');
        }
    }
}

//when the mouse leaves result cell
function resultCellUnhovered(id) {
    for (var i=0; i<markers.length; i++){
        if (markers[i].args.marker_id == id){
            markers[i].div.classList.remove('customMarker-hovered');
        }
    }
}


//do the query based on map viewport
function mapBoundsDidChanged() {
    myBundle.doQueryFromMapCoordinates(map);
}
