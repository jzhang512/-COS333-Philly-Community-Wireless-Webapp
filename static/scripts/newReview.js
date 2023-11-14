
$("#submit-review").click(submitReview);
$("#close-review").click(clearReview);

function clearReview() {
    $('#review-text').val('');
    $('input[name="star-rating"]:checked').prop('checked', false);
    // $('#stars').val('');
}

function submitReview() {
    let review = {};

    let stars = $('input[name="star-rating"]:checked').val();
    if (stars <= 0 || stars > 5) {
        return
    }
    review["pin_id"] = active_id;
    review["stars"] = stars;
    review["text"] = $("#review-text").val();
    review["time"] = new Date();
    // review["stars"] = $("#stars").val();

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

