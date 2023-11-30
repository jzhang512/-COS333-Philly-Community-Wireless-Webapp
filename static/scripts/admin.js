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
    else if (path == '/admin' || path == '/admin/') {
        setupDashboard();
    }

    window.addEventListener("pageshow", function(event) {
        if (event.persisted) {
            // The page was loaded from the browser cache
            checkSessionValidity();
        }
    });
}

function checkSessionValidity() {
    // Make an AJAX request to check session status
    $.ajax({
        url: "/path-to-session-check-endpoint",
        method: "GET",
        success: function(response) {
            if (!response.isLoggedIn) {
                // Redirect to the login page if the session is not active
                window.location.href = "/";
            }
        },
        error: function() {
            console.error('Error checking session');
        }
    });
}

// window.onpopstate = function(event) {
//     console.log("switch!");
//     if (event.state) {
//         // Determine what to do based on the state
//         // For example, if you store the name of the function to call in the state:
//         switch (event.state.page) {
//             case 'update':
//                 console.log("update gang");
//                 setupMap();
//                 break;
//             case 'reviews':
//                 console.log("review gang");
//                 setupReview();
//                 break;
//             case 'dashboard':
//                 console.log("dashboard gang");
//                 setupDashboard();
//                 break;
//             // ... other cases as needed
//         }
//     }
// }

function setupDashboard() {
    $('#results-div').empty();
    document.title = siteTitle;

    let mainDiv = $('<div/>').addClass("my-5").appendTo('#results-div');
    let row = $('<div/>').addClass("row").appendTo(mainDiv);
    let pending = $('<div/>', { role: 'button', class: 'jumbo m-2 col p-5 text-center rounded-3', id: 'pending-review' });
    let update = $('<div/>', { role: 'button', class: 'jumbo m-2 col p-5 text-center rounded-3', id: 'update-map' });
    let stats = $('<div/>', { role: 'button', class: 'jumbo m-2 col p-5 text-center rounded-3' });

    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none").text("Pending Reviews").appendTo(pending);
    $('<h1/>').addClass("text-body-emphasis border-bottom user-select-none").text("Update Map").appendTo(update);
    $('<h1/>').addClass("text-body-emphasis").text("Usage Statistics").appendTo(stats);

    $('<p/>').addClass("lead user-select-none").text("Approve/deny any new user-generated reviews.").appendTo(pending);
    $('<p/>').addClass("lead").text("Add/remove hotspot locations on the map.").appendTo(update);

    row.append(pending, update, stats);

    $('#pending-review').click(setupReview);
    $('#update-map').click(setupMap);


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

