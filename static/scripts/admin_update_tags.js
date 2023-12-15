
function setupTags() {
    history.pushState(null, "Update Tags", "/admin/tags");
    document.title = siteTitle + " - Update Tags";

    let tagRequestData = {
        type: 'GET',
        async: false,
        url: "/api/tags",
        headers: {
            'X-CSRFToken': csrfToken
        },
        success: function (data) {
            tags = data;
        },
        error: function () {
            makeToast(false, "Server Error. Unable to retrieve tags.");
            return;
        }
    };

    $.ajax(tagRequestData);

    setupTagsPage();
}

let activeTag = null;

function setupTagsPage() {
    $("#results-div").empty();
    $('body').addClass('vh-100 mh-100 overflow-hidden');
    $('#results-div').addClass('d-flex flex-column vh-100 mh-100 overflow-hidden');
    $("<h2/>", { class: "row m-3 flex-shrink-1" }).text("Update/Add/Remove Tags").appendTo($("#results-div"));
    let body = $("<div/>", { class: "row flex-grow-1 mt-3 overflow-hidden" }).appendTo($("#results-div"));

    // Left Side
    $("<div/>", { id: 'leftCol', class: "col-6 mh-100 pb-3 overflow-auto visible-scrollbar" }).appendTo(body);
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

    let opened = [];
    $("#tagsList").children("div").each((i, child) => {
        opened.push($(child).is(":visible"));
    });
    console.log(opened);

    $("#leftCol").empty();

    $("<div/>", { id: 'tagsList', role: "tablist", class: "list-group" }).appendTo($("#leftCol"));

    categories.forEach((cat, i) => {
        let header = $('<button/>', { class: "list-group-item category-list-item list-group-item-primary" }).text(cat);
        $('#tagsList').append(header);
        let tagsList = $('<div/>', { id: "collapse" + cat });
        if (opened && !opened[i]) {
            tagsList.hide();
        }
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
    $('<i/>').addClass('d-flex justify-content-center pt-1').text("Click a category to expand").appendTo('#leftCol');
}

function setupRightCol() {
    let newTagButton = $("<button/>", { id: 'newTagButton', class: 'btn btn-success btn-dark-blue' }).text("Add New").appendTo($("#rightCol"));

    newTagButton.click(createAddForm);
}

function setTag(tag) {
    let row = $('<span/>', { class: 'd-flex justify-content-between' });
    row.append($("<span/>").text(tag["tag_name"]));

    let icons = $("<span/>");
    let editButton = $("<button/>", { class: 'mx-2 btn btn-warning btn-dark-blue', text: "Edit" }).appendTo(icons);
    let deleteButton = $("<button/>", {
        class: 'btn btn-danger btn-complement-white',
        text: "Delete",
        "data-bs-toggle": 'modal',
        "data-bs-target": '#deleteTagModal'
    }).appendTo(icons);

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

    let body = $("<div/>", { class: "modal-body p-3" }).appendTo(modal);
    $("<p/>").text("Are you sure you want to delete this tag?").appendTo(body);
    $("<p/>").text("Deleting this tag will remove it from any hotspots to which it is currently assigned.").appendTo(body);
    $("<strong/>").text("This action can't be undone.").appendTo($("<p/>")).appendTo(body);

    let footer = $("<div/>", { class: "modal-footer" }).appendTo(modal);
    $("<button/>", { id: "deleteFinal", class: "btn btn-danger btn-dark-blue" }).text("Delete").appendTo(footer);
    $("<button/>", { class: "btn btn-secondary btn-complement-white", "data-bs-dismiss": "modal" }).text("Cancel").appendTo(footer);
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

    let approve = $("<button/>", { class: 'mx-2 btn btn-success btn-circle btn-small btn-confirm-decision', text: "Confirm" });
    let cancel = $("<button/>", { class: 'btn btn-warning btn-circle btn-small btn-complement-white', text: "Cancel" });

    row.append(input, approve, cancel);
    row.appendTo($("#tag" + tag["tag_id"]));

    approve.click(() => {
        var new_name = input.val().trim();

        if (!new_name) {
            makeToast(false, "Please provide a tag name.");
            return;
        }
        console.log(new_name);

        for (const tag2 of tags) {
            if (tag2["category"] == tag["category"] && tag2["tag_name"].toLowerCase() == new_name.toLowerCase()) {
                makeToast(false, "This tag already exists.");
                return;
            }
        }

        tag["tag_name"] = new_name;

        let request = {
            type: 'POST',
            url: "/api/modify_tags",
            data: JSON.stringify([tag]),
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: async (result) => {
                if (result != "Success") {
                    makeToast(false, "Server error: Unable to edit tag.");
                    console.log(result);
                    return;
                }
                makeToast(true, "Successfully edited tag!");
                // update tags
                tags = await getTags(setupLeftCol);
            },
            error: function () {
                makeToast(false, "Server error: Unable to edit tag.")
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
    $("#modalTitle").text('Delete "' + tag["tag_name"] + '" Tag');
    $("#deleteFinal").click(() => {
        console.log("Deleting " + tag["tag_name"]);
        let request = {
            type: 'POST',
            url: "/api/delete_tags",
            data: JSON.stringify([tag["tag_id"]]),
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: async (result) => {
                if (result != "Success") {
                    makeToast(false, "Server error: Unable to delete tag.");
                    return;
                }

                // update tags
                makeToast(true, "Successfully deleted tag!");
                tags = await getTags();
                setupLeftCol();
            },
            error: function () {
                makeToast(false, "Server error: Unable to delete tag.")
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
    label.append($("<div/>", { class: "col" }).append($("<small/>").html("<i>30 char. max (keep single-word lengths under 12 char. for optimal display)</i>")))
    form.append(label);

    let nameInput = $("<input/>", { type: "text", class: "form-control", placeholder: "Tag Name", maxlength: nameCharLimit });
    form.append(nameInput);

    form.append($("<h5/>", { class: "mt-3" }).text("Category"));
    let selectCat = $("<select/>", { class: "form-select" }).appendTo(form);

    // categories.forEach((cat) => {
    //     selectCat.append($("<option>", { value: cat }).text(cat));
    // })

    selectCat.append($("<option>", { value: "Accessibility" }).text("Accessibility"));
    selectCat.append($("<option>", { value: "Amenities" }).text("Amenities"));
    selectCat.append($("<option>", { value: "Cost" }).text("Cost"));
    selectCat.append($("<option>", { value: "Establishment" }).text("Establishment"));
    selectCat.append($("<option>", { value: "Password" }).text("Password"));
    selectCat.append($("<option>", { value: "Privacy" }).text("Privacy"));

    let buttons = $("<div/>", { class: "form-row mt-4" }).appendTo(form);
    let approve = $("<button/>", { class: "btn btn-success me-3 btn-dark-blue" }).text("Add Tag");
    let cancel = $("<button/>", { class: "btn btn-warning btn-complement-white" }).text("Cancel");
    buttons.append(approve, cancel);

    approve.click(() => {
        let new_tag = {};
        new_tag["tag_name"] = nameInput.val().trim();
        new_tag["category"] = selectCat.val().trim();
        console.log(new_tag);

        if (!new_tag["tag_name"]) {
            makeToast(false, "Please provide a tag name.");
            return;
        }
        for (const tag of tags) {
            if (tag["category"] == new_tag["category"] && tag["tag_name"].toLowerCase() == new_tag["tag_name"].toLowerCase()) {
                makeToast(false, "This tag already exists.");
                return;
            }
        }

        let request = {
            type: 'POST',
            url: "/api/create_tags",
            data: JSON.stringify([new_tag]),
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: async (result) => {
                if (result != "Success") {
                    makeToast(false, "Server error: Unable to create tag.");
                    console.log(result);
                    return;
                }
                // update tags
                makeToast(true, "Successfully created tag!");
                tags = await getTags();
                //setupLeftCol();
                setupTagsPage();
            },
            error: function () {
                makeToast(false, "Server error: Unable to create tag.")
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
