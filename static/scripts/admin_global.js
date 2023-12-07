$('document').ready(setup);

let siteTitle = "PCW Admin";


async function setup() {
    let path = window.location.pathname;
    // console.log(hotspots)
    // console.log(tags)

    // if (!hotspots.length || !tags.length) {
    //     console.log("setting");
    //     setGlobalVars();
    // }

    // if (tags == "Database Error") {
    //     tags = [];
    //     alert("Database error fetching tags");
    // }

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

    let mainDiv = $('<div/>').addClass("m-5").appendTo('#results-div');
    let row = $('<div/>').addClass("row").appendTo(mainDiv);
    let pending = $('<div/>', { role: 'button', class: 'jumbo m-3 col p-5 text-center rounded-3', id: 'pending-review' });
    let update = $('<div/>', { role: 'button', class: 'jumbo m-3 col p-5 text-center rounded-3', id: 'update-map' });
    let admin = $('<div/>', { role: 'button', class: 'jumbo m-3 col p-5 text-center rounded-3', id: 'manage-admin' });

    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none p-2").text("Pending Reviews").appendTo(pending);
    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none p-2").text("Update Map").appendTo(update);
    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none p-2").text("Manage Admin").appendTo(admin);

    $('<p/>').addClass("lead user-select-none").text("Approve/deny any new user-generated reviews.").appendTo(pending);
    $('<p/>').addClass("lead user-select-none").text("Add/remove hotspot locations on the map.").appendTo(update);
    $('<p/>').addClass("lead user-select-none").text("Grant or remove administrator privileges.").appendTo(admin)
    row.append(pending, update, admin);

    $('#pending-review').click(function () {
        window.location.href = '/admin/reviews';
    });
    $('#update-map').click(function () {
        window.location.href = '/admin/update';
    });
    $('#manage-admin').click(function () {
        window.location.href = '/admin/manage';
    });


}

