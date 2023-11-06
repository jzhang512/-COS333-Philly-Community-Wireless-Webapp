function fillPopup(hotspot, reviews) {
    // Add name
    const location = document.getElementById('location');
    const locationName = document.createTextNode(hotspot['name']);
    location.appendChild(locationName);

    // Add address
    const address = document.getElementById('address');
    const addressText = document.createTextNode(hotspot['address']);
    address.appendChild(addressText);

    // Add upload/download speeds
    const ulSpeed = document.getElementById('ul_speed');
    const ulSpeedText = document.createTextNode(hotspot['ul_speed']);
    ulSpeed.appendChild(ulSpeedText);

    const dlSpeed = document.getElementById('dl_speed');
    const dlSpeedText = document.createTextNode(hotspot['dl_speed']);
    dlSpeed.appendChild(dlSpeedText);

    // Add description
    if (hotspot['descrip']) {
        const descDiv = document.getElementById('desc_div');
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
    const tagsList = document.getElementById('tags_list');
    tags = hotspot['tags']
    if (tags.length > 0) {
        for (const key in tags) {
            if (tags.hasOwnProperty(key)) {
                const name = tags[key].tag_name;
                const li = document.createElement("li");
                li.textContent = name;
                tagsList.appendChild(li)
            }
        }
        console.log(tags)
    }
    else {  // no tags for given hotspot
        const tag = document.createElement("li");
        tag.textContent = "No tags to display.";
        tagsList.appendChild(tag);
    }

    // Add Reviews
    const reviewList = document.getElementById('review_list');
    if (reviews.length == 0) {
        const review = document.createElement("li");
        const reviewText = document.createTextNode("No reviews.");
        review.appendChild(reviewText);
        reviewList.appendChild(review);
    }
    for (const review of reviews) {
        const reviewDiv = document.createElement("li");
        const starsPara = document.createElement("p");
        const stars = document.createTextNode("Stars: " + review['stars']);
        const bodyPara = document.createElement("p");
        const body = document.createTextNode(review['text']);
        const timePara = document.createElement("p");
        const time = document.createTextNode(review['time']);
        
        starsPara.appendChild(stars);
        bodyPara.appendChild(body);
        timePara.appendChild(time);
        reviewDiv.appendChild(starsPara);
        reviewDiv.appendChild(bodyPara);
        reviewDiv.appendChild(timePara);
        reviewList.appendChild(reviewDiv);
    }
}
