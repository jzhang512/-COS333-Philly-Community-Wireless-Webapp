window.onload = fillReviews()

function fillReviews(reviews) {
    const reviewsDiv = document.getElementById('review-list');

    if (reviews.length == 0) {
        reviewsDiv.textContent = "No unverified reviews.";
    }

    for (const review in reviews) {
        reviewsDiv.innerHTML = "";
        const newReview = document.createElement("p");
        newReview.textContent = "Review " + review['pin_id'];
        reviewsDiv.appendChild(newReview);
    }

}

function displayActive(review) {
    const activeDiv = document.getElementById("active-card");
    activeDiv.innerHTML = '';
    if (review == null) {
        const cardText = document.createElement("p");
        cardText.textContent = "No review selected";
        activeDiv.appendChild(cardText);
    }

    else {

        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");
        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        const cardTitle = document.createElement("h5")
        cardTitle.classList.add("card-title");
        const title = document.createTextNode("Review " + i);
        const starsPara = document.createElement("p");
        const stars = document.createTextNode("Stars: " + review['stars']);
        const timePara = document.createElement("p");
        const time = document.createTextNode(review['time']);
        const bodyPara = document.createElement("p");
        const body = document.createTextNode(review['text']);
        const verify = document.createElement("button");
        verify.id = 'verify';
        const deny = document.createElement("button");
        deny.id = 'deny';


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

        cardDiv.appendChild(cardBody);
        activeDiv.appendChild(cardDiv);

        verify.addEventListener('click', function () {
            manageReview(true, review["pin_id"]);
        });
        deny.addEventListener('click', function () {
            manageReview(false, review["pin_id"]);
        });
    }
}

async function manageReview(isVerify, id) {
    if (isVerify) {
        // Load hotspots and popup html
        const response = await fetch("/api/approve_review?id=" + id);

        const activeDiv = document.getElementById("active-card");
        activeDiv.innerHTML = '';
        const cardText = document.createElement("p");
        cardText.textContent = "No review selected";
        activeDiv.appendChild(cardText);

    }
    else {
        // Load hotspots and popup html
        const response = await fetch("/api/reject_review?id=" + id);

        const activeDiv = document.getElementById("active-card");
        activeDiv.innerHTML = '';
        const cardText = document.createElement("p");
        cardText.textContent = "No review selected";
        activeDiv.appendChild(cardText);
    }
}