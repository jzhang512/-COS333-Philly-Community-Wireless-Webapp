
$('#pending-review').click(setupReview);

async function setupReview() {
    const response = await fetch("/api/pending_reviews");
    const reviews = await response.json();
    fillReviews(reviews);
}

function fillReviews(reviews) {
    $("#results-div").empty();

    let grid = $('<div/>').addClass("row main-grid");
    let reviewList = $('<div/>').addClass("col reviews");
    let activeCard = $('<div/>').addClass("col card active-card").text("No review selected.");
    activeCard.prop('id', 'active-card');

    if (reviews.length == 0) {
        reviewList.text("No pending reviews at this time.")
    }

    for (let review of reviews) {
        console.log(review);

        let revCard = $("<div/>").addClass("row card review-elem");
        revCard.prop('id', review['review_id']);
        let revTitle = $("<div/>").addClass("card-title").text("Review " + review['review_id'])

        revCard.append(revTitle);
        reviewList.append(revCard);

        revCard.click(function () {
            displayActive(review);
        });
    }
    grid.append(reviewList, activeCard);
    $("#results-div").append(grid);

}

function displayActive(review) {
    console.log("display active");
    let activeDiv = $('#active-card');
    activeDiv.empty();

    if (review == null) {
        const cardText = document.createElement("p");
        cardText.textContent = "No review selected";
        activeDiv.appendChild(cardText);
    }

    else {
        console.log("creating active card!");
        // const cardDiv = document.createElement("div");
        // cardDiv.classList.add("card");
        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        const cardTitle = document.createElement("h5")
        cardTitle.classList.add("card-title");
        const title = document.createTextNode("Review " + review["review_id"]);
        const starsPara = document.createElement("p");
        const stars = document.createTextNode("Stars: " + review["stars"]);
        const timePara = document.createElement("p");
        const time = document.createTextNode(review['time']);
        const bodyPara = document.createElement("p");
        const body = document.createTextNode(review['text']);
        const verify = document.createElement("button");
        verify.textContent = "Verify";
        verify.classList.add("btn");
        verify.classList.add("btn-primary");
        verify.classList.add("verify");
        verify.id = 'verify';
        const deny = document.createElement("button");
        deny.textContent = "Deny";
        deny.id = 'deny';
        deny.classList.add("btn");
        deny.classList.add("btn-primary");
        deny.classList.add("deny");


        cardTitle.appendChild(title);
        starsPara.appendChild(stars);
        timePara.appendChild(time);
        bodyPara.appendChild(body);

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(starsPara);
        cardBody.appendChild(timePara);
        cardBody.appendChild(bodyPara);
        cardBody.appendChild(verify);
        cardBody.appendChild(deny);

        // cardDiv.appendChild(cardBody);
        activeDiv.append(cardBody);

        verify.addEventListener('click', function () {
            manageReview(true, review["review_id"]);
        });
        deny.addEventListener('click', function () {
            manageReview(false, review["review_id"]);
        });
    }
}

async function manageReview(isVerify, id) {
    if (isVerify) {
        // Load hotspots and popup html
        const response = await fetch("/api/approve_review?id=" + id, { method: "POST" });
        const reviewCard = document.getElementById(id);
        if (reviewCard)
            reviewCard.remove();

        const activeDiv = document.getElementById("active-card");
        activeDiv.innerHTML = '';
        const cardText = document.createElement("p");
        cardText.textContent = "No review selected";
        activeDiv.appendChild(cardText);

    }
    else {
        // Load hotspots and popup html
        const response = await fetch("/api/reject_review?id=" + id, { method: "POST" });
        const reviewCard = document.getElementById(id);
        if (reviewCard) {
            console.log("remove" + id);
            reviewCard.remove();
        }
        const activeDiv = document.getElementById("active-card");
        activeDiv.innerHTML = '';
        const cardText = document.createElement("p");
        cardText.textContent = "No review selected";
        activeDiv.appendChild(cardText);
    }
}