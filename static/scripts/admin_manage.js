const csrfToken = $('meta[name="csrf-token"]').attr('content');

function setupManage() {
    history.pushState(null, "Manage Admin", "/admin/manage");
    document.title = siteTitle + " - Manage";

    let requestDataAdmin = {
        type: 'GET',
        url: "/api/get_all_admin",
        success: handleResponseManage
    };

    $.ajax(requestDataAdmin);
}

function setupAdminList(admins) {
    // Clear existing content and prepare for new content
    $("#results-div").empty();
    $('body').addClass('vh-100 mh-100 overflow-auto');
    $('#results-div').addClass("d-flex flex-column vh-100 mh-100")

    $('<h2/>').addClass("row m-3 flex-shrink-1").text("Add/Remove Administrators").appendTo('#results-div');
    let mainGridAdmin = $('<div/>').addClass("row flex-grow-1 mt-3").appendTo('#results-div');

    let leftCol = $('<div/>').addClass("col-lg-4 col-md-6 col-sm-12 mh-100 pb-3").appendTo(mainGridAdmin);
    let rightCol = $('<div/>').addClass("col-8 mh-100 px-3 pb-5").appendTo(mainGridAdmin);

    let addDivAdmin = $('<div/>').appendTo(rightCol);

    let addAdminHeader = $('<h5>').appendTo(addDivAdmin);
    addAdminHeader.text('Add New Administrator');
    let searchBox = $('<input type="text" placeholder="Enter Admin Email", class="form-control" id="add_email">').appendTo(addDivAdmin);
    let addNew = $('<button/>', { type: 'button', class: 'btn btn-success my-3 btn-dark-blue', id: 'new-admin', text: 'Add New' }).appendTo(addDivAdmin);
    $('<br>').appendTo(addDivAdmin);

    let authorized_header_text = $('<span class = "row"><h5> Authorized Administrators </h5><span>').appendTo(leftCol);

    const confirmAdmin = $('<a/>', { id: 'confirmAdmin', type: "button", class: "btn btn-secondary btn-confirm-decision", text: 'Confirm' });

    let searchDiv = $('<div/>');
    $('<input type="text" class="form-control search-box" id="search_admin_emails" placeholder = "Search Admin Emails Here">').appendTo(searchDiv);
    $('#search_hotspots_update').on('input', debouncedGetResults);

    authorized_header_text.after(searchDiv);

    let editButton = $('<button/>', {
        type: 'button',
        class: 'btn btn-primary my-3 btn-dark-blue',
        id: 'edit-admins',
        text: 'Edit'
    });

    searchDiv.after(editButton);

    $('<button/>', {
        type: 'button',
        id: 'delete-all-admins',
        class: 'btn btn-danger ms-2 my-3 invisible btn-complement-white',
        'data-bs-container': "body",
        'data-bs-custom-class': 'popover-center',
        'data-bs-toggle': "popover",
        'data-bs-placement': "bottom",
        'data-bs-html': true,
        'data-bs-trigger': "focus",
        title: '<small>Confirm Selection</small>',
        'data-bs-content': confirmAdmin.prop('outerHTML'),
        text: 'Delete Selected'
    }).appendTo(leftCol);


    $('<div/>', { role: 'tablist', id: 'list-tab', class: 'list-group authorized-admin-list overflow-auto visible-scrollbar' }).appendTo(leftCol);



    // let paneGroup = $('<div/>', { id: 'nav-tabContent', class: 'tab-content' }).appendTo(paneCol);
    // listGroup.prop('role', 'tablist');
    // listGroup.prop('id', 'list-tab');

    getSearchResultsAdmins();
    $('#search_admin_emails').on('input', debouncedGetResultsAdmin);

    editButton.click(function () {
        toggleEditMode();
    });

    addNew.click(function () {
        console.log("enter: " + $('#add_email').val())
        addAdmin($('#add_email').val());
    });


}

function makeAdminElem(admins) {
    let adminItem = $('<div/>', {
        class: 'list-group-item d-flex justify-content-between align-items-center',
        id: 'admin-item-' + admins['admin_id']
    });

    // Admin label
    $('<label/>', {
        for: 'admin-' + admins['admin_id'],
        text: admins['admin_key'],
        class: 'flex-grow-1 text-wrap'
    }).appendTo(adminItem);

    // Checkbox (hidden initially)
    let adminCheckbox = $('<input/>', {
        type: 'checkbox',
        class: 'admin-checkbox',
        id: 'admin-' + admins['admin_id']
    }).appendTo(adminItem);
    
    adminCheckbox.hide();

    return adminItem;
}

function getSearchResultsAdmins() {
    let query = $('#search_admin_emails').val();
    console.log("Searching for " + query);

    const by_name_admins = admins.filter(item => item["admin_key"].toLowerCase().includes(query.toLowerCase()));
    // .toLowerCase().includes(query.toLowerCase()));

    // console.log(by_name_admins)

    populateAdmins(by_name_admins);
}

function populateAdmins(admins) {
    console.log("Populating " + admins.length + " elements.");
    $('#list-tab').empty();
    // $('#nav-tabContent').empty();
    for (let admin of admins) {
        makeAdminElem(admin).appendTo('#list-tab');
        // makePaneElem(hotspot).appendTo('#nav-tabContent');
    }
}

function addAdmin(adminName) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (adminName === '') {
        $('#add_email').val('');
        makeToast(false, "Please enter an email.");
        return;
    }

    if (!emailRegex.test(adminName)) {
        $('#add_email').val('');
        makeToast(false, "Please enter a valid email address.");
        return;
    }

    let addAdminRequest = {
        type: 'POST',
        async: false,
        url: "/api/add_admin",
        data: JSON.stringify(adminName),
        contentType: 'application/json',
        error: function () {
            makeToast(false, "Server error. Unable to add admin.");
            return;
        },
        success: function () {
            makeToast(true, "Successfully added admin!");
            console.log("Admin created!")
            resetPaneViewAdmin()
        },
        headers: {
            'X-CSRFToken': csrfToken
        }
    };

    $.ajax(addAdminRequest);
}

function deleteAdmin() {
    var selectedAdmins = [];
    $('.admin-checkbox:checked').each(function () {
        let adminId = $(this).attr('id').split('-')[1]; // Extract the admin ID from the checkbox ID
        selectedAdmins.push(adminId);
    });

    if (selectedAdmins.length === 0) {
        makeToast(false, "Please select at least one admin.")
        return;
    }

    let deleteAdminRequest = {
        type: 'POST',
        async: false,
        url: "/api/delete_admin",
        data: JSON.stringify(selectedAdmins),
        contentType: 'application/json',
        error: function () {
            makeToast(false, "Server error. Unable to delete admin(s).");
            return;
        },
        success: function () {
            makeToast(true, "Successfully deleted admin(s)!");
            console.log("Admin Deleted!")
            resetPaneViewAdmin()
        },
        headers: {
            'X-CSRFToken': csrfToken
        }
    };

    $.ajax(deleteAdminRequest);
}

function toggleEditMode() {
    // Toggle edit mode
    $('.admin-checkbox').each(function () {
        // Check if the checkbox is currently visible
        if ($(this).is(':visible')) {
            $(this).hide(); 
            $(this).prop('disabled', true);
        } else {
            $(this).show();
            $(this).prop('disabled', false);
        }
    });

    // Additional logic to handle edit mode can be added here
    $('#delete-all-admins').toggleClass('invisible visible');
}

function exitEditMode() {
    $('.admin-checkbox').each(function () {
        $(this).hide(); 
        $(this).prop('disabled', true);
    });
}

function resetPaneViewAdmin(id) {
    $('#list-' + id + '-tab').removeClass('active');
    $('#list-' + id).removeClass("active show");

    setupManage();
}

/* POST Request Handelers */
function handleResponseManage(data) {
    admins = data;
    // console.log("Admins: " + admins)
    admins.sort((a, b) => a['admin_key'].localeCompare(b['admin_key']))
    setupAdminList(admins);

    // Prevent duplicate event handler instances
    $(document).on('click', '#confirmAdmin', function () {
        console.log("clickerino");
        deleteAdmin();
    });

    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
}

// function getSearchResults() {
//     let query = $('#search_hotspots_update').val();

//     exitEditMode();

//     const by_name_hotspots = hotspots.filter(item => item["name"].toLowerCase().includes(query.toLowerCase()));

//     populateHotspots(by_name_hotspots);
//     $(".selectpicker").selectpicker('render');
// }


function debouncedGetResultsAdmin() {
    clearTimeout(search_check_timer);
    search_check_timer = setTimeout(getSearchResultsAdmins, 500);
}

// function populateHotspots(hotspots) {
//     $('#list-tab').empty();
//     $('#nav-tabContent').empty();
//     let i = 0;
//     for (let hotspot of hotspots) {
//         if (i == 0) {
//             makeTabElem(hotspot).addClass("active").appendTo('#list-tab');
//             makePaneElem(hotspot).addClass("active show").appendTo('#nav-tabContent');
//         }
//         else {
//             makeTabElem(hotspot).appendTo('#list-tab');
//             makePaneElem(hotspot).appendTo('#nav-tabContent');
//         }
//         i += 1;
//     }
// }