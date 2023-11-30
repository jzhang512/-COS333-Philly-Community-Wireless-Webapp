
// $('#pending-review').click(setupReview);

async function setupReview() {
    history.pushState(null, "Verify Reviews", "/admin/reviews");
    document.title = siteTitle + " - Reviews"
    const response = await fetch("/api/pending_reviews");
    const reviews = await response.json();
    fillReviews(reviews);
}

function fillReviews(reviews) {
    $("#results-div").empty();

    $('<h2/>').addClass("m-3").text("Approve/Deny Reviews").appendTo('#results-div');

    if (reviews.length == 0) {
        let empty = $('<p/>').addClass('m-3').text("No pending reviews at this time.");
        $("#results-div").append(empty);
        return;
    }

    let mainGrid = $('<div/>').addClass("row main-grid");
    let reviewCol = $('<div/>').addClass("col-4").appendTo(mainGrid);
    let paneCol = $('<div/>').addClass("col-8").appendTo(mainGrid);

    // let activeCol = $('<div/>', { id: 'active-card', class: 'col card active-card' }).text("No review selected.").appendTo(mainGrid);
    let reviewGroup = $('<div/>', { role: 'tablist', id: 'list-tab', class: 'list-group' }).appendTo(reviewCol); // reviews class add
    let paneGroup = $('<div/>', { id: 'nav-tabContent', class: 'tab-content' }).appendTo(paneCol);

    // let pane = $('<div/>').addClass("col-8 mh-100 px-3 pb-5 overflow-auto").appendTo(mainGrid);



    for (let review of reviews) {
        // console.log(review);
        let infoTab = {
            class: 'list-group-item list-group-item-action',
            id: 'list-' + review['review_id'] + '-tab',
            'data-bs-toggle': 'list',
            href: '#list-' + review['review_id'],
            role: 'tab',
            'aria-controls': 'list-' + review['review_id'],
            text: "Review " + review['review_id']
        };

        $('<a/>', infoTab).appendTo(reviewGroup);

        let infoPane = {
            class: 'tab-pane fade border rounded',
            id: 'list-' + review['review_id'],
            role: 'tabpanel',
            'aria-labelledby': 'list-' + review['review_id'] + '-list'
        };

        let currPane = $('<div/>', infoPane).append(makeReviewCard(review));
        currPane.appendTo(paneGroup);
    }
    $('#results-div').append(mainGrid);
}

function makeReviewCard(review) {
    console.log("display active");
    let reviewCard = $('<div/>').addClass("m-3");

    console.log("creating active card!");
    let cardBody = $('<div/>').addClass('card-body').appendTo(reviewCard);

    $('<h5/>').addClass('card-title').text("Review " + review["review_id"]).appendTo(cardBody);
    let stars = makeStars(review["stars"]);
    stars.appendTo(cardBody);

    $('<p/>').text(review['time']).appendTo(cardBody);
    $('<p/>').text(review['text']).appendTo(cardBody);

    let approve = $('<button/>', { id: 'approve', class: 'btn btn-success', text: 'Approve' }).appendTo(cardBody);
    let deny = $('<button/>', { id: 'deny', class: 'btn btn-danger ms-2', text: 'Deny' }).appendTo(cardBody);
    reviewCard.append(cardBody);

    approve.click(function () {
        manageReview(true, review["review_id"]);
    });

    deny.click(function () {
        manageReview(false, review["review_id"]);
    });

    return reviewCard;
}

function makeStars(numStars) {
    console.log("making stars!");
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
    if (isVerify) {
        // Approve this review
        await fetch("/api/approve_review?id=" + id, { method: "POST" });
    }
    else {
        // Deny this review
        await fetch("/api/reject_review?id=" + id, { method: "POST" });
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