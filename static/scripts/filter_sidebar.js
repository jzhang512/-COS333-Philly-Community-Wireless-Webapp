$(document).ready(function() {
    $("#sidebarToggle").click(function() {
        console.log("toggled")
        $("#leftSidebar").toggleClass("left-sidebar-active");
        $("#map").toggleClass("active-sidebar-map");
        $("#nav-bar").toggleClass("navbar-active-sidebar")
    });
});