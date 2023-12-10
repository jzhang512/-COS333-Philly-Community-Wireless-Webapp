$('document').ready(setup);

let siteTitle = "PCW Admin";
let tags = []
let hotspots = []

async function setup() {
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
    else if (path == '/admin/tags') {
        setupTags();
    }
    else if (path == '/admin' || path == '/admin/') {
        setupDashboard();
    }
}

async function getHotspots(errorFunc = () => { }) {
    let response = await fetch("/api/hotspots");
    hotspots = await response.json();

    if (hotspots == "Database Error") {
        hotspots = [];
        alert("Database error fetching hotspots");
        errorFunc();
    }
}

async function getTags(errorFunc = () => { }) {
    response = await fetch("/api/tags");
    let tags = await response.json();

    if (tags == "Database Error") {
        tags = [];
        alert("Database error fetching tags");
        errorFunc();
    }
    return tags
}

function setupDashboard() {
    $('#results-div').empty();
    document.title = siteTitle;

    let mainDiv = $('<div/>').addClass("m-5").appendTo('#results-div');
    let row = $('<div/>').addClass("row").appendTo(mainDiv);
    let pending = $('<div/>', { role: 'button', class: 'jumbo m-3 col p-5 text-center rounded-3', id: 'pending-review' });
    let update = $('<div/>', { role: 'button', class: 'jumbo m-3 col p-5 text-center rounded-3', id: 'update-map' });
    let admin = $('<div/>', { role: 'button', class: 'jumbo m-3 col p-5 text-center rounded-3', id: 'manage-admin' });
    let update_tags = $('<div/>', { role: 'button', class: 'jumbo m-3 col p-5 text-center rounded-3', id: 'update-tags' });

    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none p-2").text("Pending Reviews").appendTo(pending);
    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none p-2").text("Update Map").appendTo(update);
    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none p-2").text("Admin Management").appendTo(admin);
    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none p-2").text("Update Tags").appendTo(update_tags);

    $('<p/>').addClass("lead user-select-none").text("Approve/deny any new user-generated reviews.").appendTo(pending);
    $('<p/>').addClass("lead user-select-none").text("Add/remove hotspot locations on the map.").appendTo(update);
    $('<p/>').addClass("lead user-select-none").text("Grant or remove administrator privileges.").appendTo(admin);
    $('<p/>').addClass("lead user-select-none").text("Add/edit/remove existing tags").appendTo(update_tags);
    row.append(pending, update, admin, update_tags);

    $('#pending-review').click(function () {
        window.location.href = '/admin/reviews';
    });
    $('#update-map').click(function () {
        window.location.href = '/admin/update';
    });
    $('#manage-admin').click(function () {
        window.location.href = '/admin/manage';
    });
    $('#update-tags').click(function () {
        window.location.href = '/admin/tags';
    });
}

