
$("#submit-review").click(submitReview);
$("#close-review").click(clearReview);

function clearReview() {
    $('#success-review').remove();
    $('#failure-review').remove();
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
        async: false,
        url: "/api/publish_review",
        data: JSON.stringify(review),
        contentType: 'application/json',
        success: handleSuccess,
        error: handleError
        // Message box on success, alert on fail
    };

    $.ajax(requestData);
    // clearReview();
}

function handleSuccess() {
    let message = $('<div/>').text("Successfully created review!");
    //let image = $('<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-check-circle-fill\" viewBox=\"0 0 16 16\">< path d = \"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z\" /></svg>');
    let success = $('<div/>', { id: 'success-review', class: 'alert alert-success d-flex align-items-center', role: 'alert' }).append(message);
    $('#review-body').prepend(success);
    $('#submit-review').prop('disabled', true);
}

function handleError(data) {
    let message = $('<div/>').text("Failed to create review. Server error: " + data.toString());
    //let image = $('<svg class="bi flex-shrink-0 me-2" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>');
    let failure = $('<div/>', { id: 'failure-review', class: 'alert alert-danger d-flex align-items-center', role: 'alert' }).append(message);
    $('#review-body').prepend(failure);
    $('#submit-review').prop('disabled', true);
}

