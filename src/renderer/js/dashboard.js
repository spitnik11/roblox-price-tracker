// dashboard.js

// Access the ipcRenderer API and logger exposed by preload.js
const { ipcRenderer, logError } = window.electronAPI;
import { formatPrice } from '../../shared/utils.js';

const itemsContainer = document.getElementById('items-container');

/**
 * Render item card and include per-item refresh
 */
function renderItem(item) {
    const el = document.createElement('div');
    el.className = 'item';
    el.id = `item-${item.id}`;

    el.innerHTML = `
        <p>${item.name}</p>
        <p id="price-${item.id}">Price: ${formatPrice(item.price)}</p>
        ${item.alert ? '<span class="alert">Price Drop!</span>' : ''}
        <button class="refresh-one" data-id="${item.id}">Refresh</button>
    `;

    return el;
}

/**
 * Render all items
 */
function updateUI(items) {
    itemsContainer.innerHTML = '';

    items.forEach(item => {
        const el = renderItem(item);
        itemsContainer.appendChild(el);
    });

    // Add event listeners for individual refresh buttons
    document.querySelectorAll('.refresh-one').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            try {
                const itemId = e.target.dataset.id;

                const result = await ipcRenderer.invoke('refresh-data', itemId);

                if (result.error) {
                    alert(result.error);
                    return;
                }

                // Update only the price for that item
                document.getElementById(`price-${itemId}`).innerText = `Price: ${formatPrice(result.price)}`;
            } catch (err) {
                logError(`Refresh button error for item ${e.target.dataset.id}: ${err.message}`);
                alert('An error occurred while refreshing this item.');
            }
        });
    });
}

/**
 * Initial load
 */
window.onload = async () => {
    try {
        const items = await ipcRenderer.invoke('get-watchlist'); // Use 'get-watchlist' to load all items
        updateUI(items);
    } catch (err) {
        logError(`Dashboard initial load error: ${err.message}`);
        alert('An error occurred while loading your watchlist.');
    }
};
