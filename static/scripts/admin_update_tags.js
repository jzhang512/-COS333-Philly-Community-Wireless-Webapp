
function setupTags() {
    history.pushState(null, "Update Tags", "/admin/tags");
    document.title = siteTitle + " - Update Tags";
    $("#results-div").empty();

    let tagRequestData = {
        type: 'GET',
        async: false,
        url: "/api/tags",
        success: function (data) {
            tags = data;
        },
        error: function (data) {
            makeToast(false, data);
            return;
        }
    };

    $.ajax(tagRequestData);

    setupTagsPage();
}

let activeTag = null;

function setupTagsPage() {
    $('body').addClass('vh-100 mh-100 overflow-hidden');
    $('#results-div').addClass('d-flex flex-column vh-100 mh-100 overflow-hidden');
    $("<h2/>", { class: "row m-3 flex-shrink-1" }).text("Update/Add/Remove Tags").appendTo($("#results-div"));
    let body = $("<div/>", { class: "row flex-grow-1 mt-3 overflow-hidden" }).appendTo($("#results-div"));

    // Left Side
    $("<div/>", { id: 'leftCol', class: "col-6 mh-100 pb-3 overflow-auto" }).appendTo(body);
    setupLeftCol();

    // Right Side
    $("<div/>", { id: 'rightCol', class: "col-6 mh-100 pb-3 overflow-auto" }).appendTo(body);
    setupRightCol();

    // Modal
    createModal();
}

function getCategories() {
    let categories = new Set();
    tags.forEach((tag) => {
        categories.add(tag['category']);
    })
    categories = [...categories];
    categories.sort();
    return categories;
}

function setupLeftCol() {
    let categories = getCategories();

    $("#leftCol").empty();

    $("<div/>", { id: 'tagsList', role: "tablist", class: "list-group" }).appendTo($("#leftCol"));

    categories.forEach((cat) => {
        let header = $('<button/>', { class: "list-group-item category-list-item list-group-item-primary" }).text(cat);
        $('#tagsList').append(header);
        let tagsList = $('<div/>', { id: "collapse" + cat });
        tagsList.hide();
        $('#tagsList').append(tagsList);

        header.click(() => {
            tagsList.slideToggle();
        })
    });

    tags.forEach((tag) => {
        let listItem = $('<div/>', { class: "list-group-item", id: "tag" + tag["tag_id"] });
        listItem.append(setTag(tag));
        listItem.appendTo($("#collapse" + tag["category"]));
    });
}

function setupRightCol() {
    let newTagButton = $("<button/>", { id: 'newTagButton', class: 'btn btn-success btn-confirm-decision' }).text("Add New").appendTo($("#rightCol"));

    newTagButton.click(createAddForm);
}

function setTag(tag) {
    let row = $('<span/>', { class: 'd-flex justify-content-between' });
    row.append($("<span/>").text(tag["tag_name"]));

    let icons = $("<span/>");
    let editButton = $("<button/>", { class: 'btn btn-warning btn-dark-blue' }).append($("<i/>", { class: 'bi bi-pencil' })).appendTo(icons);
    let deleteButton = $("<button/>", { class: 'btn btn-danger btn-complement-white', "data-bs-toggle": 'modal', "data-bs-target": '#deleteTagModal' })
        .append($("<i/>", { class: 'bi bi-trash' })).appendTo(icons);
    row.append(icons);

    editButton.click(() => {
        editTag(tag);
    });

    deleteButton.click(() => {
        console.log("Trash clicked");
        deleteTag(tag);
    });

    return row;
}

function createModal() {
    let modal = $("<div/>", { class: "modal-content" })
        .appendTo($("<div/>", { class: "modal-dialog", role: "document" })
            .appendTo($("<div/>", { id: "deleteTagModal", class: "modal fade", role: "dialog", tabindex: "-1", "aria-hidden": "true" })
                .appendTo($('body'))));

    let header = $("<div/>", { class: "modal-header" }).appendTo(modal);
    $("<h5/>", { id: "modalTitle", class: "modal-title" }).appendTo(header);
    $("<button/>", { type: "button", class: "btn-close", "data-bs-dismiss": "modal", "aria-label": "Close" }).appendTo(header);

    let body = $("<div/>", { class: "modal-body" }).appendTo(modal);
    $("<p/>").text("Are you sure you want to delete this tag?").appendTo(body);
    $("<p/>").text("Deleting this tag will remove it from any hotspots to which it is currently assigned. This action can't be undone.").appendTo(body);

    let footer = $("<div/>", { class: "modal-footer" }).appendTo(modal);
    $("<button/>", { id: "deleteFinal", class: "btn btn-danger" }).text("Delete").appendTo(footer);
    $("<button/>", { class: "btn btn-secondary", "data-bs-dismiss": "modal" }).text("Cancel").appendTo(footer);
}

function editTag(tag) {
    console.log("clicked");
    if (activeTag !== null) {
        $("#tag" + activeTag["tag_id"]).empty();
        $("#tag" + activeTag["tag_id"]).append(setTag(activeTag));
    }

    activeTag = tag;
    $("#tag" + tag["tag_id"]).empty();

    let row = $("<span/>", { class: 'd-flex form-row' });
    let input = $("<input/>", { type: 'text', class: 'form-control', value: tag["tag_name"] });
    let approve = $("<button/>", { class: 'btn btn-success btn-circle btn-small btn-confirm-decision' }).append($("<i/>", { class: 'bi bi-check2-circle' }));
    let cancel = $("<button/>", { class: 'btn btn-warning btn-circle btn-small btn-complement-white' }).append($("<i/>", { class: 'bi bi-x-circle' }));
    row.append(input, approve, cancel);
    row.appendTo($("#tag" + tag["tag_id"]));

    approve.click(() => {
        tag["tag_name"] = input.val();
        console.log(tag["tag_name"]);
        let request = {
            type: 'POST',
            url: "/api/modify_tags",
            data: JSON.stringify([tag]),
            contentType: 'application/json',
            success: async (result) => {
                if (result != "Success") {
                    alert("Error writing to database");
                    console.log(result);
                    return;
                }

                // update tags
                tags = await getTags(setupLeftCol);
            }
        };
        $.ajax(request);

        activeTag = null;
        $("#tag" + tag["tag_id"]).empty();
        $("#tag" + tag["tag_id"]).append(setTag(tag));
    })

    cancel.click(() => {
        activeTag = null;
        $("#tag" + tag["tag_id"]).empty();
        $("#tag" + tag["tag_id"]).append(setTag(tag));
    })
}

function deleteTag(tag) {
    $("#modalTitle").text("Delete " + tag["tag_name"]);
    $("#deleteFinal").click(() => {
        console.log("Deleting " + tag["tag_name"]);
        console.log(tag);
        let request = {
            type: 'POST',
            url: "/api/delete_tags",
            data: JSON.stringify([tag["tag_id"]]),
            contentType: 'application/json',
            success: async (result) => {
                if (result != "Success") {
                    alert("Error writing to database");
                    console.log(result);
                    return;
                }

                // update tags
                tags = await getTags();
                setupLeftCol();
            }
        };
        $.ajax(request);
        $("#deleteTagModal").modal("hide");
    });
}

function createAddForm() {
    let nameCharLimit = 30;
    let categories = getCategories();
    $("#rightCol").empty();
    let form = $("<div/>", { class: "form-group" }).appendTo($("#rightCol"));

    let label = $("<div/>", { class: "row" });
    label.append($("<div/>", { class: "col-auto" }).append($("<h5/>").text("Name")))
    label.append($("<div/>", { class: "col" }).append($("<small/>").html("<i>30 char. max</i>")))
    form.append(label);

    let nameInput = $("<input/>", { type: "text", class: "form-control", placeholder: "Tag Name", maxlength: nameCharLimit });
    form.append(nameInput);

    form.append($("<h5/>", { class: "mt-3" }).text("Category"));
    let selectCat = $("<select/>", { class: "form-select" }).appendTo(form);

    categories.forEach((cat) => {
        selectCat.append($("<option>", { value: cat }).text(cat));
    })

    let buttons = $("<div/>", { class: "form-row mt-4" }).appendTo(form);
    let approve = $("<button/>", { class: "btn btn-success me-3 btn-dark-blue" }).text("Add Tag");
    let cancel = $("<button/>", { class: "btn btn-warning btn-complement-white" }).text("Cancel");
    buttons.append(approve, cancel);

    approve.click(() => {
        let tag = {};
        tag["tag_name"] = nameInput.val();
        tag["category"] = selectCat.val();
        console.log(tag);
        let request = {
            type: 'POST',
            url: "/api/create_tags",
            data: JSON.stringify([tag]),
            contentType: 'application/json',
            success: async (result) => {
                if (result != "Success") {
                    alert("Error writing to database");
                    console.log(result);
                    return;
                }

                // update tags
                tags = await getTags();
                setupLeftCol();
            }
        };
        $.ajax(request);

        $("#rightCol").empty();
        setupRightCol();
    })

    cancel.click(() => {
        $("#rightCol").empty();
        setupRightCol();
    })
}
