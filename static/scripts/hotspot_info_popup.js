function setupHotspotInfo() {
    $('#add-review').click(() => {
        reviewVisible = true;
        console.log("Add Review :3");
        console.log(reviewVisible);
        $('#sidebar').hide();
    });

    $('#sidebar').on('show.bs.modal', () => {
        let hotspot = getHotspot(displayed, active_id);
        history.pushState(null, "", "?hotspot_id=" + active_id);
        document.title = siteTitle + " - " + hotspot['name'];
    });

    $('#sidebar').on('hide.bs.modal', () => {
        console.log(reviewVisible);
        if (!reviewVisible) {
            history.pushState(null, "", "/");
            document.title = siteTitle;
        }
    });
}

// Master function. 
async function makePopup(hotspot) {
    let id = hotspot['hotspot_id'];
    active_id = id;

    history.pushState(null, "", "?hotspot_id=" + id);
    document.title = siteTitle + " - " + hotspot['name'];

    // Send requests to your Flask server
    const review_response = await fetch("/api/reviews?id=" + id);
    let reviews = await review_response.json();
    if (reviews == "Database Error") {
        reviews = [];
        alert("Database Error");
    }

    // call script to populate popup with information
    fillPopup(hotspot, reviews);

    map.flyTo({
        center: [hotspot['longitude'], hotspot['latitude']],
        zoom: 15
    })

    $('#sidebar').modal('show');

    $('#hotspot-info-exit-unhovered, #hotspot-info-exit-hovered').on('mouseover', function () {
        $('#hotspot-info-exit-hovered').css({
            'display':'block',
        });
        $('#hotspot-info-exit-unhovered').css({
            'display':'none',
        });
    });

    $('#hotspot-info-exit-unhovered, #hotspot-info-exit-hovered').on('mouseout', function () {
        $('#hotspot-info-exit-unhovered').css({
            'display':'block',
        });
        $('#hotspot-info-exit-hovered').css({
            'display':'none',
        });
    });
}

// Helper for makePopup().
function fillPopup(hotspot, reviews) {

    // Create query call for Google Map place search.
    let query = hotspot['name'] + " " + hotspot['address'];
    let en_query = encodeURIComponent(query);

    let link = "https://www.google.com/maps/search/?api=1&query=" + en_query;

    // Add name
    $('#hotspot-title').text(hotspot['name']);

    // Add address, linked to corresponding Google Map query.
    $('#hotspot-googlemaps-link')
        .attr('href', link)
        .text(hotspot['address'])
        .append('<svg id = "new-tab-hotspot" class="external-link-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">' +
        '<path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>' +
        '<path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>' +
        '</svg>');

    // Reset and add tags
    $('#tag-container').empty();
    let tags = hotspot['tags'];
    for (let tag of tags) {
        let pill = $('<span>');
        pill.addClass('badge text-bg-info mx-1 tag-onhotspot-display').text(tag['tag_name']);
        $('#tag-container').append(pill);
    }

    // Add upload/download speeds
    if (hotspot['ul_speed'] >= 0) {
        $('#no-ul-speed').hide();
        $('#ul-speed-container').show();
        $('#ul-speed').text(hotspot['ul_speed'] + ' Mbps');
    } else {
        $('#no-ul-speed').hide();
        $('#ul-speed-container').hide();
    }
    
    if (hotspot['dl_speed'] >= 0) {
        $('#no-dl-speed').hide();
        $('#dl-speed-container').show();
        $('#dl-speed').text(hotspot['dl_speed'] + ' Mbps');
    } else {
        $('#no-dl-speed').hide();
        $('#dl-speed-container').hide();
    }

    if (hotspot['dl_speed'] < 0 && hotspot['ul_speed'] < 0) {
        $('#speed-table-display').hide();
    }

    // Add description
    $('#descrip-div').empty();
    if (hotspot['descrip']) {
        let lbl = $('<h5>').text("Description");
        let content = $('<p>').addClass('descrip-content').text(hotspot['descrip']);
        $('#descrip-div').append(lbl, content);
    }

    // Add avg rating
    // if (hotspot['avg_rating']) {
    //     // Make star.
    //     let star = $('<span class = "star-span-spacing">').addClass("d-inline-block");
    //     let icon = document.createElement("i");
    //     icon.classList.add("fas", "fa-star", "star");
    //     star.append(icon);

    //     $('#avg-rating').text("Average Rating: " + parseFloat(hotspot['avg_rating']).toFixed(1));
    //     $('#avg-rating').append(star.prop("outerHTML"));
    // }
    // else {
    //     $('#avg-rating').text("Average Rating: None");
    // }

    // Add Reviews

    // Let user know how many reviews there are with average rating.
    if (hotspot['avg_rating']) {
        // Make star.
        let star = $('<span class = "star-span-spacing">').addClass("d-inline-block");
        let icon = document.createElement("i");
        icon.classList.add("fas", "fa-star", "star");
        star.append(icon);

        $('#avg-rating').text("Average " + parseFloat(hotspot['avg_rating']).toFixed(1));
        $('#avg-rating').append(star.prop("outerHTML"));
    }
    else {
        $('#avg-rating').text('');
    }

    if (reviews.length) {
        $("#number-reviews-text").text("(" + reviews.length + ")");
    }
    else {
        $('#number-reviews-text').text('');
    }
    

    $('#review-list').empty();

    if (reviews.length == 0) {
        let card = $('<div>').addClass('card review-card');
        let body = $('<div>').addClass('card-body').text("No reviews yet.");
        card.append(body);
        $('#review-list').append(card);
    }

    for (let review of reviews) {
        // if (review['text']) {
            let card = $('<div>').addClass('card review-card');
            let body = $('<div>').addClass('card-body');
            let starDiv = makeStars(review['stars']);
            let header = $('<div>').addClass('card-header review-time-container').append(starDiv).append('<span>'+review['time']+'</span>');
            let text = $('<div>').text(review['text']);
            body.append(text);
            card.append(header, body);
            $('#review-list').append(card);
        // }
    }
}

function makeStars(numStars) {
    let num = parseInt(numStars);
    let container = $('<span>');

    for (let i = 0; i < num; i++) {
        let star = $('<span>').addClass("d-inline-block");
        let icon = document.createElement("i");
        icon.classList.add("fas", "fa-star", "star");
        star.append(icon);
        container.append(star);
    }

    return container
}
