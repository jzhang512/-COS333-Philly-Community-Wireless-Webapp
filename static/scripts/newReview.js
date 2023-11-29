
$("#submit-review").click(submitReview);
$("#close-review").click(clearReview);

function clearReview() {
    $('#review-text').val('');
    $('input[name="star-rating"]:checked').prop('checked', false);
}

function submitReview() {
    let review = {};

    let stars = $('input[name="star-rating"]:checked').val();
    if (stars <= 0 || stars > 5) {
        return
    }
    review["hotspot_id"] = active_id;
    review["rating"] = stars;
    review["text"] = $("#review-text").val();
    review["time"] = new Date().toLocaleDateString();

    let requestData = {
        type: 'POST',
        url: "/api/publish_review",
        data: JSON.stringify(review),
        contentType: 'application/json'
        // Message box on success, alert on fail
    };

    $.ajax(requestData);
    clearReview();
}

