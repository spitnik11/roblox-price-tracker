// Access the ipcRenderer API exposed by the preload script
const { ipcRenderer } = window.electronAPI;

// Import the helper function to format prices nicely
import { formatPrice } from '../../shared/utils.js';

// Get references to the refresh button and the container where item cards will go
const refreshBtn = document.getElementById('refresh-btn');
const itemsContainer = document.getElementById('items-container');

// Keep track of the last time data was refreshed (in ms)
let lastRefreshTime = 0;

// When the refresh button is clicked...
refreshBtn.addEventListener('click', async () => {
    const now = Date.now();

    // Prevent refreshing if it's been less than 30 seconds (cooldown)
    if (now - lastRefreshTime < 30000) {
        return alert('Cooldown: wait 30 seconds'); // Notify the user
    }

    lastRefreshTime = now; // Update the last refresh timestamp

    // Request fresh price data from the backend
    const priceData = await ipcRenderer.invoke('refresh-data');

    // Update the UI with the new data
    updateUI(priceData);
});

// Update the dashboard with a list of items and their price info
function updateUI(items) {
    itemsContainer.innerHTML = ''; // Clear the container

    items.forEach(item => {
        const el = document.createElement('div'); // Create a container for each item
        el.className = 'item'; // Apply styling class

        // Fill the container with item name, formatted price, and optional alert message
        el.innerHTML = `
            <p>${item.name}</p>
            <p>Price: ${formatPrice(item.price)}</p>
            ${item.alert ? '<span class="alert">Price Drop!</span>' : ''}
        `;

        itemsContainer.appendChild(el); // Add the item to the dashboard
    });
}

// When the page loads, automatically fetch and display item prices
window.onload = async () => {
    const priceData = await ipcRenderer.invoke('refresh-data'); // Get latest data
    updateUI(priceData); // Populate the UI
};
