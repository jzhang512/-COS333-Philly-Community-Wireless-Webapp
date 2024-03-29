
// $('#pending-review').click(setupReview);

async function setupReview() {
    history.pushState(null, "Verify Reviews", "/admin/reviews");

    document.title = siteTitle + " - Reviews"
    let hotspots = [];
    let reviews = [];

    let requestHotspotData = {
        type: 'GET',
        async: false,
        url: '/api/hotspots',
        success: function (data) {
            hotspots = data;
        },
        error: function () {
            makeToast(false, "Server issue. Unable to retrieve hotspots.")
            return;
        }
    };
    $.ajax(requestHotspotData);

    let requestReviewData = {
        type: 'GET',
        async: false,
        url: '/api/pending_reviews',
        success: function (data) {
            reviews = data;
        },
        error: function () {
            makeToast(false, "Server issue. Unable to retrieve reviews.")
            return;
        }
    };
    $.ajax(requestReviewData);

    for (let i = 0; i < reviews.length; i++) {
        let hotspot = getHotspot(hotspots, reviews[i]['hotspot_id']);
        if (hotspot == null) {
            console.log("couldn't find associated hotspot");
        }
        reviews[i]['hotspot'] = hotspot;
    }
    fillReviews(reviews);
}

function fillReviews(reviews) {
    $('body').addClass('vh-100 mh-100 overflow-hidden');

    $("#results-div").empty();
    $('#results-div').addClass("d-flex flex-column vh-100 mh-100 overflow-hidden")

    $('<h2/>').addClass("row m-3 flex-shrink-1").text("Approve/Deny Reviews").appendTo('#results-div');

    if (reviews.length == 0) {
        let empty = $('<p/>').addClass('m-3').text("No pending reviews at this time.");
        $("#results-div").append(empty);
        return;
    }

    let mainGrid = $('<div/>').addClass("row main-grid flex-grow-1 overflow-hidden");
    let reviewCol = $('<div/>').addClass("col-4 border-end mh-100 pb-3 overflow-auto visible-scrollbar").appendTo(mainGrid);
    let paneCol = $('<div/>').addClass("col-8 col-sm-8").appendTo(mainGrid);

    // let activeCol = $('<div/>', { id: 'active-card', class: 'col card active-card' }).text("No review selected.").appendTo(mainGrid);
    let reviewGroup = $('<div/>', { role: 'tablist', id: 'list-tab', class: 'list-group' }).appendTo(reviewCol); // reviews class add
    let paneGroup = $('<div/>', { id: 'nav-tabContent', class: 'tab-content' }).appendTo(paneCol);

    // let num_reviews = $('<i/>', {})

    let i = 0;
    for (let review of reviews) {
        let infoTab = {
            class: 'list-group-item list-group-item-custom-color list-group-item-action',
            id: 'list-' + review['review_id'] + '-tab',
            'data-bs-toggle': 'list',
            href: '#list-' + review['review_id'],
            role: 'tab',
            'aria-controls': 'list-' + review['review_id'],
            text: "Review " + review['review_id'] + " - " + review['hotspot']['name']
        };

        let infoPane = {
            class: 'tab-pane fade border rounded',
            id: 'list-' + review['review_id'],
            role: 'tabpanel',
            'aria-labelledby': 'list-' + review['review_id'] + '-list'
        };

        let tab = $('<a/>', infoTab).appendTo(reviewGroup);
        let pane = $('<div/>', infoPane).append(makeReviewCard(review));

        if (i == 0) {
            tab.addClass("active");
            pane.addClass("active show");
        }

        pane.appendTo(paneGroup);
        i += 1;
    }
    $('#results-div').append(mainGrid);
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
}

function makeReviewCard(review) {
    console.log("display active");
    let reviewCard = $('<div/>').addClass("p-5");

    console.log("creating active card!");
    let cardBody = $('<div/>').addClass('card-body').appendTo(reviewCard);

    $('<h5/>').addClass('card-title').html("<h3>Review " + review["review_id"] + "</h3>").appendTo(cardBody);
    let stars = makeStars(review["stars"]);
    stars.appendTo(cardBody);

    $('<p/>').text(review['time']).appendTo(cardBody);
    $('<p/>').html("<i>Location</i>: " + review['hotspot']['name']).appendTo(cardBody);
    $('<p/>').html("<i>Address</i>: " + review['hotspot']['address']).appendTo(cardBody);

    let text = review['text'] || "<i>User left no review.</i>"
    $('<p/>').addClass("border rounded p-2").html(text).appendTo(cardBody);

    // let buttonDiv = $('<div/>').addClass("d-flex justify-content-evenly").appendTo(cardBody);

    let confirmApprove = $('<a/>', { id: 'confirmApprove' + review['review_id'], type: "button", class: "btn btn-secondary btn-confirm-decision", text: 'Confirm' });
    let confirmDeny = $('<a/>', { id: 'confirmDeny' + review['review_id'], type: "button", class: "btn btn-secondary btn-confirm-decision", text: 'Confirm' });

    $('<button/>', {
        type: 'button',
        id: 'approve' + review['review_id'],
        class: 'btn btn-success btn-dark-blue me-3 mt-3',
        'data-bs-container': "body",
        'data-bs-custom-class': 'popover-center',
        'data-bs-toggle': "popover",
        'data-bs-placement': "bottom",
        'data-bs-html': true,
        'data-bs-trigger': "focus",
        title: '<small>Confirm Selection</small>',
        'data-bs-content': confirmApprove.prop('outerHTML'),
        text: 'Approve'
    }).appendTo(cardBody);

    $('<button/>', {
        type: 'button',
        id: 'approve' + review['review_id'],
        class: 'btn btn-danger btn-complement-white mt-3',
        'data-bs-container': "body",
        'data-bs-custom-class': 'popover-center',
        'data-bs-toggle': "popover",
        'data-bs-placement': "bottom",
        'data-bs-html': true,
        'data-bs-trigger': "focus",
        title: '<small>Confirm Selection</small>',
        'data-bs-content': confirmDeny.prop('outerHTML'),
        text: 'Deny'
    }).appendTo(cardBody);

    reviewCard.append(cardBody);

    $(document).on('click', '#confirmApprove' + review['review_id'], function () {
        manageReview(true, review["review_id"]);
    });

    $(document).on('click', '#confirmDeny' + review['review_id'], function () {
        manageReview(false, review["review_id"]);
    });

    return reviewCard;
}

function makeStars(numStars) {
    let num = parseInt(numStars);
    let container = $('<div>').addClass('d-flex my-2 justify-content-start');

    for (let i = 0; i < num; i++) {
        let star = $('<span>').addClass("d-inline-block");
        let icon = document.createElement("i");
        icon.classList.add("fas", "fa-star", "star");
        star.append(icon);
        container.append(star);
    }

    return container
}

async function manageReview(isVerify, id) {
    let response;

    if (isVerify) {
        // Approve this review
        let requestData = {
            type: 'POST',
            url: '/api/approve_review?id=' + id,
            headers: {
                'X-CSRFToken': csrfToken
            },
            error: function () {
                makeToast(false, "Server issue. Unable to approve this review.")
                return;
            },
            success: function () {
                makeToast(true, "Successfully approved this review!");
            }
        };
        $.ajax(requestData);

    }
    else {
        // Deny this review
        let requestData = {
            type: 'POST',
            url: '/api/reject_review?id=' + id,
            headers: {
                'X-CSRFToken': csrfToken
            },
            error: function () {
                makeToast(false, "Server issue. Unable to deny this review.")
                return;
            },
            success: function () {
                makeToast(true, "Successfully denied this review!");
            }
        };
        $.ajax(requestData);
    }

    let reviewTab = $('#list-' + id + '-tab');
    let reviewCard = $('#list-' + id);

    let nextTab = reviewTab.next();
    let nextCard = reviewCard.next();

    if (reviewCard && reviewTab) {
        reviewCard.remove();
        reviewTab.remove();
    }

    if (nextTab && nextCard) {
        nextTab.addClass('active');
        nextCard.addClass('active show');
    }
    else {
        let empty = $('<p/>').addClass('m-3').text("No pending reviews at this time.");
        $("#results-div").append(empty);
    }
}