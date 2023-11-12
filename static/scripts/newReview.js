function makeNewReview() {
    $('#exampleModal').modal('hide');
    console.log("new review!");
    console.log(stored_hotspot);
    console.log(stored_reviews);
    
    fillPopup(stored_hotspot, stored_reviews);
    console.log("worked?");
    $('#exampleModal').modal('show');
    console.log("display");
}