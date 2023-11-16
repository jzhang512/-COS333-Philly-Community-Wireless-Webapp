$('document').ready(setup);

function setup() {
    console.log("setup!");
    // let requestData = {
    //     type: 'GET',
    //     url: "/admin",
    //     success: handleResponse,
    //     error: handleError
    // };

    // $.ajax(requestData);
}

function handleResponse(data) {
    console.log("hlhkhl");
    $('#results-div').html(data);
}

function handleError() {
    alert('Error: Failed to fetch data from server.');
}

function setPendingReview() {
    console.log("set reviews");

    
}

