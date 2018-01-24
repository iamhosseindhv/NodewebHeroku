/**
 * Created by iamhosseindhv on 24/06/2017.
 */
var queryString = require('query-string');

//do the query based on map viewport
var doQueryFromMapCoordinates = function(map) {
    const ne_lat = map.getBounds().getNorthEast().lat();
    const ne_lng = map.getBounds().getNorthEast().lng();
    const sw_lat = map.getBounds().getSouthWest().lat();
    const sw_lng = map.getBounds().getSouthWest().lng();

    var parsed = queryString.parse(location.search);
    parsed.ne_lat = ne_lat;
    parsed.ne_lng = ne_lng;
    parsed.sw_lat = sw_lat;
    parsed.sw_lng = sw_lng;
    parsed.search_by_map = 'true';
    const stringified = queryString.stringify(parsed);

    //here instead of overwriting url which caused the whole page to reload,
    //you should make a AJAX call to only reload result section of the page
    location.search = stringified;
};

var doQueryFromSearchedAddress = function (selectedPlace) {
    const formattedAddress = selectedPlace.formatted_address;
    var parsed = queryString.parse(location.search);
    //reset offset
    parsed.offset = undefined;

    //update browsers url
    const path = window.location.pathname;
    const splited = path.split('/');
    var ddd = formattedAddress.split(', ').join('-');
    ddd = ddd.split(' ').join('-');
    splited[2] = ddd;
    const newUrl = splited.join('/') + "?" + queryString.stringify(parsed);
    window.history.pushState("", "", newUrl);

    //here instead of overwriting url which caused the whole page to reload,
    //you should make a AJAX call to only reload result section of the page
    parsed.location = formattedAddress;
    const url = location.protocol + '//' + location.hostname + '/api/explore?' + queryString.stringify(parsed);
    queryNewListings(url);
};

function queryNewListings(url) {
    loadingStarted();
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            const res = JSON.parse(this.responseText);
            const listings = res.listings;
            const listings_count = res.listings_count;
            loadNewListings(listings, listings_count);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function loadNewListings(listings, listings_count) {

    clearMarkers();
    $('#main').empty();
    $('#pagination').empty();

    for (var i=0 ; i<listings.length ; i++){
        const listing = listings[i];

        var resultCell = $('<div class="cell result-cell">').appendTo('#main');
        resultCell.attr("id", listing.id);
        <!---->
        var parentLink = $('<a>').appendTo(resultCell);
        const link = "../../rooms/" + listing.id + "?";
        parentLink.attr("href", link);
        <!---->
        var box = $('<div class="box">').appendTo(parentLink);
        <!---->
        var marginFree = $('<div class="margin-free">').appendTo(box);
        <!---->
        var cellThumbnail = $('<div class="cell-thumbnail">').appendTo(marginFree);
        <!---->
        var cellThumbnail_img = $('<img class="margin-free">').appendTo(cellThumbnail);
        cellThumbnail_img.attr("src", listing.thumbnail_img);
        // cellThumbnail_img.attr("src", "/images/owl.jpg");
        <!---->
        var cellInfo = $('<div class="cell-info">').appendTo(parentLink);
        <!---->
        var cellInfoDetail = $('<div class="cell-info-detail">').appendTo(cellInfo);
        <!---->
        var firstRow = $('<div class="cell-info--row">').appendTo(cellInfoDetail);
        var price = $('<span class="cell-info--price">').appendTo(firstRow);
        price.text('£' + listing.price);
        var title = $('<span class="cell-info--title">').appendTo(firstRow);
        title.text(listing.title);
        <!---->
        var secondRow = $('<div class="cell-info--row">').appendTo(cellInfoDetail);
        var type = $('<span class="cell-info--type">').appendTo(secondRow);
        type.text(listing.type);
        var bedCount = $('<span class="cell-info--bedroomCount">').appendTo(secondRow);
        bedCount.text(listing.bedroom_count + " Bedroom");
        <!---->
        var thirdRow = $('<div class="cell-info--row">').appendTo(cellInfoDetail);
        var reviewStars = $('<div class="cell-info--review-stars">').appendTo(thirdRow);
        for (var i=0 ; i<5 ; i++){
            var startsIndividual = $('<span class="review-stars--individual">').appendTo(reviewStars);
            var svg = $('<svg viewBox="0 0 1000 1000" role="presentation" focusable="false">').appendTo(startsIndividual);
            var path = $('<path d="M971.5 379.5c9 28 2 50-20 67L725.4 618.6l87 280.1c11 39-18 75-54 75-12 0-23-4-33-12l-226.1-172-226.1 172.1c-25 17-59 12-78-12-12-16-15-33-8-51l86-278.1L46.1 446.5c-21-17-28-39-19-67 8-24 29-40 52-40h280.1l87-278.1c7-23 28-39 52-39 25 0 47 17 54 41l87 276.1h280.1c23.2 0 44.2 16 52.2 40z">').appendTo(svg);
        }
        var reviewCount = $('<div class="cell-info--review-count">').appendTo(thirdRow);
        reviewCount.text(listing.review_count + " reviews");
        <!---->
        var cellInfoHeart = $('<div class="cell-info-heart">').appendTo(cellInfo);
        var svgheart = $('<svg class="icon-heart" viewBox="0 0 50 50">').appendTo(cellInfoHeart);
        var pathheart = $('<path xmlns="http://www.w3.org/2000/svg" d="M24.85,10.126c2.018-4.783,6.628-8.125,11.99-8.125c7.223,0,12.425,6.179,13.079,13.543  c0,0,0.353,1.828-0.424,5.119c-1.058,4.482-3.545,8.464-6.898,11.503L24.85,48L7.402,32.165c-3.353-3.038-5.84-7.021-6.898-11.503  c-0.777-3.291-0.424-5.119-0.424-5.119C0.734,8.179,5.936,2,13.159,2C18.522,2,22.832,5.343,24.85,10.126z"/>').appendTo(svgheart);
        <!---->
        createMarker(listing.latitude, listing.longitude, listing.id);
    }
    fitMarkers();
    myModule.createPagination(listings_count);
    $('#footer-listing-count').text(listings_count);

    loadingDidFinish();

    //when result cell hovered, related marker gets highlighted
    $('.result-cell').mouseenter(function() {
        resultCellHovered(this.id);
    });
    $('.result-cell').mouseleave(function() {
        for (var i=0; i<markers.length; i++){
            if (markers[i].id == this.id){
                markers[i].setIcon(null);
            }
        }
    });
}


function loadingStarted() {
    $("#main-wrap").animate({
        scrollTop: 0
    }, 200);
    $('.overlay').show();
}

function loadingDidFinish() {
    $('.overlay').hide();
}

module.exports = {
    doQueryFromMapCoordinates: doQueryFromMapCoordinates,
    doQueryFromSearchedAddress: doQueryFromSearchedAddress,
    queryNewListings: queryNewListings
};


