// watchlist.js

// Access the ipcRenderer API exposed through the preload script
const { ipcRenderer, logError } = window.electronAPI;

// Get references to the input, button, and list elements from the HTML
const input = document.getElementById('item-id-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('watchlist');

// Handle the "Add" button click
addBtn.addEventListener('click', async () => {
    try {
        const itemId = input.value.trim(); // Get and trim input value
        if (!itemId) return; // Do nothing if input is empty

        // Send the item ID to the main process to add to the watchlist
        await ipcRenderer.invoke('add-item', itemId);

        // Clear the input field
        input.value = '';

        // Refresh the watchlist display
        await renderWatchlist();
    } catch (err) {
        logError(`Add button error: ${err.message}`);
    }
});

// Handle clicks on the watchlist (for removing items)
list.addEventListener('click', async (e) => {
    try {
        if (e.target.dataset.removeId) {
            // Send remove request to main process using the item's ID
            await ipcRenderer.invoke('remove-item', e.target.dataset.removeId);

            // Refresh the watchlist display
            await renderWatchlist();
        }
    } catch (err) {
        logError(`Remove item error: ${err.message}`);
    }
});

// Fetch and display the current watchlist from the backend
async function renderWatchlist() {
    try {
        const watchlist = await ipcRenderer.invoke('get-watchlist'); // Ask main process for watchlist
        list.innerHTML = ''; // Clear the current list

        // Loop through each item ID and create a list element with a remove button
        watchlist.forEach(id => {
            const el = document.createElement('li');
            el.innerHTML = `${id} <button data-remove-id="${id}">Remove</button>`;
            list.appendChild(el); // Add to the list
        });
    } catch (err) {
        logError(`Render watchlist error: ${err.message}`);
    }
}

// Automatically render the watchlist when the window loads
window.onload = renderWatchlist;
