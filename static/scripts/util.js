// Miscellaneous functions.

function getHotspot(hotspots, id) {
    for (const hotspot of hotspots) {
        if (hotspot['hotspot_id'] == id) return hotspot;
    }
    return null;
}

function getTag(tags, id) {
    for (const tag of tags) {
        if (tag['tag_id'] == id) return tag;
    }
    return null;
}

function average(list) {
    let sum = 0.0;
    for (const x of list) {
        sum += x;
    }
    if (list.length > 0) {
        return (sum / list.length).toFixed(2);
    } else
        return null;
}

function union(arrA, arrB) {
    return [...new Set([...arrA, ...arrB])];
}

function makeToast(isSuccess, message = null) {
    const toast = document.getElementById(isSuccess ? 'successToast' : 'failToast');
    if (message) {
        const toastBody = toast.querySelector('.toast-body');
        toastBody.textContent = message;
    }
    const toastObj = new bootstrap.Toast(toast);
    toastObj.show();
}