// watchlistManager.js

function formatItemHTML(item) {
    return `
        ID: ${item.id}
        ${item.threshold !== null ? ' | Threshold: ' + item.threshold : ''}
        <button data-remove-id="${item.id}">Remove</button>
        <button data-edit-id="${item.id}">Edit Threshold</button>
    `;
}

module.exports = { formatItemHTML };
