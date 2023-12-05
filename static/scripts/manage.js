function setupManage() {
    history.pushState(null, "Manage Admin", "/admin/manage");
    document.title = siteTitle + " - Manage";

    // Clear existing content and prepare for new content
    $("#results-div").empty();

    $('#results-div').addClass("d-flex flex-column vh-100 mh-100 overflow-hidden")

    $('<h2/>').addClass("row m-3 flex-shrink-1").text("Add/Remove Administrators").appendTo('#results-div');

    // Create a form element
    let form = $('<form/>', { id: 'manage-form', class: 'manage-form' });

    // Create a text input field
    $('<input/>', {
        type: 'text',
        id: 'admin-input',
        name: 'adminName',
        placeholder: 'Enter the Email',
        class: 'form-control'
    }).appendTo(form);

    // Create a submit button
    $('<button/>', {
        type: 'submit',
        text: 'Add Admin',
        class: 'btn btn-primary mt-2'
    }).appendTo(form);

    // Append the form to your results div or another container
    $("#results-div").append(form);

    // Optional: Add an event handler for form submission
    $('#manage-form').on('submit', function(e) {
        e.preventDefault();
        // Add your form submission logic here
        let adminName = $('#admin-input').val();
        console.log('Admin Name:', adminName);
        // You might want to make an AJAX call here

        let updateRequest = {
            type: 'POST',
            url: "/api/add_admin",
            data: JSON.stringify([adminName]),
            contentType: 'application/json'
        };
        $.ajax(updateRequest);
    });
}