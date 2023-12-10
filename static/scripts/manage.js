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
    $('body').addClass('vh-100 mh-100 overflow-hidden');
    $('#results-div').addClass("d-flex flex-column vh-100 mh-100 overflow-hidden")

    $('<h2/>').addClass("row m-3 flex-shrink-1").text("Add/Remove Administrators").appendTo('#results-div');
    let mainGridAdmin = $('<div/>').addClass("row flex-grow-1 mt-3 overflow-hidden").appendTo('#results-div');

    let tabColAdmin = $('<div/>').addClass("col-lg-4 col-md-6 col-sm-12 mh-100 pb-3 overflow-auto").appendTo(mainGridAdmin);
    // let paneCol = $('<div/>').addClass("col-8 mh-100 px-3 pb-5 overflow-auto").appendTo(mainGrid);

    let searchDivAdmin = $('<div/>').appendTo(tabColAdmin);

    let search = $('<h5>').appendTo(searchDivAdmin);
    search.text('Add a New Administrator');
    let searchBox = $('<input type="text" placeholder="Enter Admin Email", class="form-control" id="add_email">').appendTo(searchDivAdmin);
    let addNew = $('<button/>', { type: 'button', class: 'btn btn-success my-3', id: 'new-admin', text: 'Add New' }).appendTo(searchDivAdmin);
    $('<br>').appendTo(searchDivAdmin);

    authorizied_text = $('<h5> Authorized Administrators </h5>').appendTo(tabColAdmin)

    let editButton = $('<button/>', {
        type: 'button',
        class: 'btn btn-primary my-3',
        id: 'edit-admins',
        text: 'Edit'
    }).appendTo(tabColAdmin);

    let deleteButton = $('<button/>', {
        type: 'button',
        class: 'btn btn-danger btn-sm',
        id: 'delete-all-admins',
        text: 'Delete All Selected Admin'
    }).appendTo(tabColAdmin);

    let tabGroup = $('<div/>', { role: 'tablist', id: 'list-tab', class: 'list-group' }).appendTo(tabColAdmin);



    // let paneGroup = $('<div/>', { id: 'nav-tabContent', class: 'tab-content' }).appendTo(paneCol);
    // listGroup.prop('role', 'tablist');
    // listGroup.prop('id', 'list-tab');

    getSearchResultsAdmins();
    //$('#search').on('input', debouncedGetResultsAdmin);

  
    editButton.click(function() {
        toggleEditMode();
    });

    deleteButton.click(function() {
        deleteAdmin();
    });

    addNew.click(function () {
        console.log("enter: " + $('#add_email').val())
        addAdmin($('#add_email').val());
    });
    // onclick.addNew(addAdmin($('#search').val()))
    // addNew.click(addAdmin($('#search').val()))
    $(".selectpicker").selectpicker('render');
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
    // let query = $('#search').val();

    const by_name_admins = admins.filter(item => item["admin_key"]);
    // .toLowerCase().includes(query.toLowerCase()));
    
    console.log(by_name_admins)

    populateAdmins(by_name_admins);
    $(".selectpicker").selectpicker('render');
}



function populateAdmins(admins) {
    $('#list-tab').empty();
    // $('#nav-tabContent').empty();
    for (let admin of admins) {
        makeAdminElem(admin).appendTo('#list-tab');
        // makePaneElem(hotspot).appendTo('#nav-tabContent');
    }
}

function toggleSelectAllAdmins() {
    // Toggle the checked state of all admin checkboxes
    $('.admin-checkbox').prop('checked', (i, val) => !val);
}

// function createNewAdmin() {
//     console.log("made new admin!")
//     $(".active").removeClass("active show");
//     if ($("#list-new")) {
//         $("#list-new").remove();
//     }
//     // makePaneElem(null).appendTo('#nav-tabContent');
//     $(".selectpicker").selectpicker('render');
// }

function addAdmin(adminName) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    
    if (adminName === '') {
        alert('Please enter a valid admin email.');
        return; // Exit the function if the input is empty
    }    
    
    if (!emailRegex.test(adminName)) {
        alert('Please enter a valid email address.');
        return; // Exit the function if the email is invalid
    }



    let addAdminRequest = {
        type: 'POST',
        async: false,
        url: "/api/add_admin",
        data: JSON.stringify(adminName),
        contentType: 'application/json',
        headers: {
            'X-CSRFToken': csrfToken
        }
    };

    $.ajax(addAdminRequest);
    // resetPaneView('new');
    console.log("Admin created!")
    resetPaneViewAdmin()
}

function deleteAdmin() {
    var selectedAdmins = [];
    $('.admin-checkbox:checked').each(function() {
        let adminId = $(this).attr('id').split('-')[1]; // Extract the admin ID from the checkbox ID
        selectedAdmins.push(adminId);
    });

    let deleteAdminRequest = {
        type: 'POST',
        async: false,
        url: "/api/delete_admin",
        data: JSON.stringify(selectedAdmins),
        contentType: 'application/json',
        headers: {
            'X-CSRFToken': csrfToken
        }
    };

    $.ajax(deleteAdminRequest);
    // resetPaneView('new');
    console.log("Admin Deleted!")
    resetPaneViewAdmin()
}

function toggleEditMode() {
    // Toggle edit mode
    $('.admin-checkbox').toggle();
    // Additional logic to handle edit mode can be added here
}

function resetPaneViewAdmin(id) {
    $('#list-' + id + '-tab').removeClass('active');
    $('#list-' + id).removeClass("active show");

    setupManage();
}

function handleResponseManage(data) {
    admins = data;
    console.log("Admins: " + admins)
    admins.sort((a, b) => a['admin_key'].localeCompare(b['admin_key']))
    setupAdminList(admins);
}