function fillPopup(hotspot, reviews) {
    // Add name
    const location = document.getElementById('hotspot-title');
    location.textContent = hotspot['name'];

    // Add address
    const address = document.getElementById('hotspot-address');
    address.textContent = hotspot['address'];

    // Add upload/download speeds
    const ulSpeed = document.getElementById('ul_speed');
    ulSpeed.textContent = hotspot['ul_speed'];
    // const ulSpeedText = document.createTextNode(hotspot['ul_speed']);
    // ulSpeed.appendChild(ulSpeedText);

    const dlSpeed = document.getElementById('dl_speed');
    dlSpeed.textContent = hotspot['dl_speed'];

    // Add description
    if (hotspot['descrip']) {
        const descDiv = document.getElementById('desc_div');
        descDiv.innerHTML = '';

        const descPara = document.createElement("p");
        const descBold = document.createElement("strong");
        const descText = document.createTextNode("Description: ");
        const descBody = document.createTextNode(hotspot['descrip']);

        descBold.appendChild(descText);
        descPara.appendChild(descBold);
        descPara.appendChild(descBody);
        descDiv.appendChild(descPara);
    }

    // Add tags
    const tagsList = document.getElementById('tag-container');
    tagsList.innerHTML = '';
    tags = hotspot['tags']
    if (tags.length > 0) {
        for (const key in tags) {
            if (tags.hasOwnProperty(key)) {
                const name = tags[key].tag_name;
                const btn = document.createElement("button");
                btn.classList.add("btn");
                btn.classList.add("btn-primary");
                btn.classList.add("tag")
                btn.textContent = name;
                btn.disabled = true;
                tagsList.appendChild(btn)
            }
        }
        // console.log(tags)
    }
    // else {  // no tags for given hotspot
    //     const tag = document.createElement("li");
    //     tag.textContent = "No tags to display.";
    //     tagsList.appendChild(tag);
    // }

    // Add Reviews
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';
    if (reviews.length == 0) {
        const review = document.createElement("p");
        const reviewText = document.createTextNode("No reviews.");
        review.appendChild(reviewText);
        reviewList.appendChild(review);
    }
    let i = 1;
    for (const review of reviews) {
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


        cardTitle.appendChild(title);
        starsPara.appendChild(stars);
        timePara.appendChild(time);
        bodyPara.appendChild(body);

        cardBody.appendChild(cardTitle);
        cardBody.appendChild(starsPara);
        cardBody.appendChild(timePara);
        cardBody.appendChild(bodyPara);

        cardDiv.appendChild(cardBody);
        reviewList.appendChild(cardDiv);
    }
}
