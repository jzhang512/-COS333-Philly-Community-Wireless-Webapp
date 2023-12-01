$('document').ready(setup);

let siteTitle = "PCW Admin"

function setup() {
    console.log("setup!");
    let path = window.location.pathname;
    
    if (path == '/admin/update') {
        setupMap();
    }
    else if (path == '/admin/reviews') {
        setupReview();
    }
    else if (path == '/admin/manage') {
        setupManage();
    }
    else if (path == '/admin' || path == '/admin/') {
        setupDashboard();
    }   
}

function setupDashboard() {
    $('#results-div').empty();
    document.title = siteTitle;

    let mainDiv = $('<div/>').addClass("my-5").appendTo('#results-div');
    let row = $('<div/>').addClass("row").appendTo(mainDiv);
    let pending = $('<div/>', { role: 'button', class: 'jumbo m-2 col p-5 text-center rounded-3', id: 'pending-review' });
    let update = $('<div/>', { role: 'button', class: 'jumbo m-2 col p-5 text-center rounded-3', id: 'update-map' });
    let management = $('<div/>', { role: 'button', class: 'jumbo m-2 col p-5 text-center rounded-3', id: 'admin-management'});

    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none").text("Pending Reviews").appendTo(pending);
    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none").text("Update Map").appendTo(update);
    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none").text("Admin Management").appendTo(management);

    $('<p/>').addClass("lead user-select-none").text("Approve/deny any new user-generated reviews.").appendTo(pending);
    $('<p/>').addClass("lead").text("Add/remove hotspot locations on the map.").appendTo(update);
    $('<p/>').addClass("lead").text("Add/remove admins who have access.").appendTo(management);

    row.append(pending, update, management);

    $('#pending-review').click(setupReview);
    $('#update-map').click(setupMap);
    $('#admin-management').click(setupManage);


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

