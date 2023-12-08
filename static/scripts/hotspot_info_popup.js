// Master function. 
async function makePopup(hotspot) {
    // Send requests to your Flask server
    let id = hotspot['hotspot_id'];
    active_id = id;

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

    history.replaceState(null, "", "?hotspot_id=" + id);

    $('#sidebar').modal('show');

    document.title = siteTitle + " - " + hotspot['name'];

    $('#sidebar').on('hide.bs.modal', () => {
        history.pushState(null, "", "/");
        document.title = siteTitle;
    })
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
        .text(hotspot['address']);

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
    if (hotspot['avg_rating']) 
        $('#avg-rating').text("Average Rating: " + parseFloat(hotspot['avg_rating']).toFixed(1));
    else
        $('#avg-rating').text("Average Rating: None");

    // Add Reviews
    $('#review-list').empty();

    if (reviews.length == 0) {
        let card = $('<div>').addClass('card');
        let body = $('<div>').addClass('card-body').text("No reviews yet.");
        card.append(body);
        $('#review-list').append(card);
    }

    for (let review of reviews) {
        let card = $('<div>').addClass('card review-card');
        let body = $('<div>').addClass('card-body');
        let starDiv = makeStars(review['stars']);
        let header = $('<div>').addClass('card-header review-time-container').append(starDiv).append('<span>'+review['time']+'</span>');
        let text = $('<div>').text(review['text']);
        body.append(text);
        card.append(header, body);
        $('#review-list').append(card);
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
