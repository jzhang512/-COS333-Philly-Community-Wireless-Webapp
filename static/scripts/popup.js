function fillPopup(hotspot, reviews) {
    // Add name
    $('#hotspot-title').text(hotspot['name']);

    // Add address
    $('#hotspot-address').text(hotspot['address']);

    // Reset and add tags
    $('#tag-container').empty();
    tags = hotspot['tags'];
    console.log(tags);
    for (let tag of tags) {
        let pill = $('<span>');
        pill.addClass('badge rounded-pill text-bg-info mx-1').text(tag['tag_name']);
        $('#tag-container').append(pill);
    }

    // Add upload/download speeds
    $('#ul-speed').text(hotspot['ul_speed'] + ' Mbps');
    $('#dl-speed').text(hotspot['dl_speed'] + ' Mbps');


    // Add description
    $('#descrip-div').empty();
    if (hotspot['descrip']) {
        console.log('activated descrip!');
        let lbl = $('<strong>').text("Description:");
        let content = $('<p>').text(hotspot['descrip']);
        $('#descrip-div').append(lbl, content);
    }

    // Add Reviews
    $('#review-list').empty();

    if (reviews.length == 0) {
        let card = $('<div>').addClass('card');
        let body = $('<div>').addClass('card-body').text("No reviews yet.");
        card.append(body);
        $('#review-list').append(card);
    }

    for (let review of reviews) {
        console.log(review);
        let card = $('<div>').addClass('card');
        let body = $('<div>').addClass('card-body');
        let title = $('<h5>').addClass('card-title').text("Review " + review['pin_id']);
        // let starDiv = makeStars(review['stars']);
        let timeFoot = $('<div>').addClass('card-footer').text(review['time']);
        let text = $('<p>').text(review['text']);

        body.append(title, text);
        card.append(body, timeFoot);
        $('#review-list').append(card);
    }
}
