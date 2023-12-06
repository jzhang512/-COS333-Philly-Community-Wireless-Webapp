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

    $('#results-div').addClass("d-flex flex-column vh-100 mh-100 overflow-hidden")

    $('<h2/>').addClass("row m-3 flex-shrink-1").text("Add/Remove Administrators").appendTo('#results-div');
    let mainGridAdmin = $('<div/>').addClass("row flex-grow-1 mt-3 overflow-hidden").appendTo('#results-div');

    let tabColAdmin = $('<div/>').addClass("col-4 border-end mh-100 pb-3 overflow-auto").appendTo(mainGridAdmin);
    // let paneCol = $('<div/>').addClass("col-8 mh-100 px-3 pb-5 overflow-auto").appendTo(mainGrid);

    let searchDivAdmin = $('<div/>').appendTo(tabColAdmin);

    let search = $('<h5>').appendTo(searchDivAdmin);
    search.text('Add New Admins');
    let searchBox = $('<input type="text" placeholder="Enter Admin Email", class="form-control" id="add_email">').appendTo(searchDivAdmin);
    $('<br>').appendTo(searchDivAdmin);

    let tabGroup = $('<div/>', { role: 'tablist', id: 'list-tab', class: 'list-group' }).appendTo(tabColAdmin);
    // let paneGroup = $('<div/>', { id: 'nav-tabContent', class: 'tab-content' }).appendTo(paneCol);
    // listGroup.prop('role', 'tablist');
    // listGroup.prop('id', 'list-tab');

    getSearchResultsAdmins();
    //$('#search').on('input', debouncedGetResultsAdmin);

    let addNew = $('<button/>', { type: 'button', class: 'btn btn-success my-3', id: 'new-admin', text: 'Add New' }).appendTo(tabColAdmin);
    
   
    addNew.click(function () {
        console.log("enter: " + $('#add_email').val())
        addAdmin($('#add_email').val());
    });
    // onclick.addNew(addAdmin($('#search').val()))
    // addNew.click(addAdmin($('#search').val()))
    $(".selectpicker").selectpicker('render');
}

function makeAdminElem(admins) {
    let adminTab = {
        class: 'list-group-item list-group-item-action',
        id: 'list-' + admins['admin_id'] + '-tab',
        'data-bs-toggle': 'list',
        href: '#list-' + admins['admin_id'],
        role: 'tab',
        'aria-controls': 'list-' + admins['admin_id'],
        text: admins['admin_key']
    };

    return $('<a/>', adminTab);
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
    console.log(adminName)
    let addAdminRequest = {
        type: 'POST',
        async: false,
        url: "/api/add_admin",
        data: JSON.stringify(adminName),
        contentType: 'application/json',
    };

    $.ajax(addAdminRequest);
    // resetPaneView('new');
    console.log("Admin created!")
    resetPaneViewAdmin()
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