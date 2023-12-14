let editing = false;

function setupManage() {
    history.pushState(null, "Manage Admin", "/admin/manage");
    document.title = siteTitle + " - Manage";

    let requestDataAdmin = {
        type: 'GET',
        url: "/api/get_all_admin",
        success: handleResponseManage,
        error: function () {
            makeToast(false, "Server error: Unable to retrieve admin.")
        }
    };

    $.ajax(requestDataAdmin);
}

function setupAdminList() {
    // Clear existing content and prepare for new content
    $("#results-div").empty();
    $('body').addClass('vh-100 mh-100 overflow-auto');
    $('#results-div').addClass("d-flex flex-column vh-100 mh-100")

    $('<h2/>').addClass("row m-3 flex-shrink-1").text("Add/Remove Administrators").appendTo('#results-div');
    let mainGridAdmin = $('<div/>').addClass("row flex-grow-1 mt-3 mb-2 overflow-hidden").appendTo('#results-div');

    let leftCol = $('<div/>').addClass("d-flex flex-column col-4 mh-100 overflow-hidden").appendTo(mainGridAdmin);
    let rightCol = $('<div/>').addClass("col-8 mh-100 px-3 pb-5").appendTo(mainGridAdmin);

    let addDivAdmin = $('<div/>').appendTo(rightCol);

    let addAdminHeader = $('<h5>').appendTo(addDivAdmin);
    addAdminHeader.text('Add New Administrator');
    $('<input type="text" placeholder="Enter Admin Email", class="form-control" id="add_email">').appendTo(addDivAdmin);
    let addNew = $('<button/>', { type: 'button', class: 'btn btn-success my-3 btn-dark-blue', id: 'new-admin', text: 'Add New' }).appendTo(addDivAdmin);
    $('<br>').appendTo(addDivAdmin);

    $('<span class = "row"><h5> Authorized Administrators </h5><span>').appendTo(leftCol);

    const confirmAdmin = $('<a/>', { id: 'confirmAdmin', type: "button", class: "btn btn-secondary btn-confirm-decision", text: 'Confirm' });

    let searchDiv = $('<div/>');
    $('<input type="text" class="form-control search-box" id="search_admin_emails" placeholder = "Search Admin Emails Here">').appendTo(searchDiv);
    $('#search_hotspots_update').on('input', debouncedGetResults);

    searchDiv.appendTo(leftCol);

    let buttonsRow = $('<div/>', { class: "d-flex" }).appendTo(leftCol);

    let editButton = $('<button/>', {
        type: 'button',
        class: 'flex-grow-1 btn btn-primary my-3 btn-dark-blue',
        id: 'edit-admins',
        text: 'Edit'
    }).appendTo(buttonsRow);

    $('<button/>', {
        type: 'button',
        id: 'delete-all-admins',
        class: 'flex-grow-1 btn btn-danger ms-2 my-3 invisible btn-complement-white',
        'data-bs-container': "body",
        'data-bs-custom-class': 'popover-center',
        'data-bs-toggle': "popover",
        'data-bs-placement': "bottom",
        'data-bs-html': true,
        'data-bs-trigger': "focus",
        title: '<small>Confirm Selection</small>',
        'data-bs-content': confirmAdmin.prop('outerHTML'),
        text: 'Delete Selected'
    }).appendTo(buttonsRow);

    let flexDiv = $('<div/>', { class: 'border rounded-2 my-3 flex-grow-1 overflow-auto visible-scrollbar' }).appendTo(leftCol)

    $('<div/>', { role: 'tablist', id: 'list-tab', class: 'list-group authorized-admin-list' }).appendTo(flexDiv);



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

function makeAdminElem(admin) {
    let adminItem = $('<div/>', {
        class: 'list-group-item d-flex justify-content-between align-items-center',
        id: 'admin-item-' + admin['admin_id']
    });

    // Admin label
    $('<label/>', {
        for: 'admin-' + admin['admin_id'],
        text: admin['admin_key'],
        class: 'flex-grow-1 text-wrap'
    }).appendTo(adminItem);

    // Checkbox (hidden initially)
    let adminCheckbox = $('<input/>', {
        type: 'checkbox',
        class: 'admin-checkbox',
        id: 'admin-' + admin['admin_id']
    }).appendTo(adminItem);

    adminCheckbox.attr("checked", admin["selected"]);
    if (!editing) {
        adminCheckbox.hide();
    }

    adminCheckbox.change(() => {
        admin["selected"] = adminCheckbox.is(":checked");
    });

    return adminItem;
}

function getSearchResultsAdmins() {
    let query = $('#search_admin_emails').val();

    const by_name_admins = admins.filter(item => item["admin_key"].toLowerCase().includes(query.toLowerCase()));
    const selected = admins.filter(item => item["selected"]);
    let displayed = union(by_name_admins, selected);

    displayed.sort((a, b) => {
        let aSearch = a["admin_key"].toLowerCase().includes(query.toLowerCase());
        let bSearch = b["admin_key"].toLowerCase().includes(query.toLowerCase());
        if (aSearch && !bSearch) {
            return -1;
        } else if (bSearch && !aSearch) {
            return 1;
        }
        return a['admin_key'].localeCompare(b['admin_key']);
    });

    if (displayed.length == 0) {
        $('#list-tab').empty();
        $('<i/>').addClass('d-flex justify-content-center pt-2').text("No results").appendTo('#list-tab');
    }
    else {
        populateAdmins(displayed);
    }

    // console.log(by_name_admins)

}

function populateAdmins(admins) {
    // console.log("Populating " + admins.length + " elements.");
    $('#list-tab').empty();
    for (let admin of admins) {
        makeAdminElem(admin).appendTo('#list-tab');
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
            //console.log("Admin created!")
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
            //console.log("Admin Deleted!")
            editing = false;
            resetPaneViewAdmin()
        },
        headers: {
            'X-CSRFToken': csrfToken
        }
    };

    $.ajax(deleteAdminRequest);
}

function toggleEditMode() {
    editing = !editing;
    if (!editing) { // reset selections
        admins.forEach((admin) => {
            admin["selected"] = false;
        });
    }

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

    getSearchResultsAdmins();
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
    admins.forEach((admin) => {
        admin["selected"] = false;
    })
    // console.log("Admins: " + admins)
    admins.sort((a, b) => a['admin_key'].localeCompare(b['admin_key']))
    setupAdminList();

    // Prevent duplicate event handler instances
    $(document).on('click', '#confirmAdmin', function () {
        console.log("clickerino");
        deleteAdmin();
    });

    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
}

function debouncedGetResultsAdmin() {
    clearTimeout(search_check_timer);
    search_check_timer = setTimeout(getSearchResultsAdmins, 500);
}