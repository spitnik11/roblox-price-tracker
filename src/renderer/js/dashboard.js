// dashboard.js

// Access the ipcRenderer API and logger exposed by preload.js
const { ipcRenderer, logError } = window.electronAPI;
import { formatPrice } from '../../shared/utils.js';

// DOM elements
const itemsContainer = document.getElementById('priceContainer');
const refreshBtn = document.getElementById('refreshBtn');
const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
const emptyStateMsg = document.getElementById('empty-state'); // Step 4: reference to empty state

// Auto-refresh state
let autoRefresh = false;
let autoRefreshInterval = null;

/**
 * Render item card and include per-item refresh
 */
function renderItem(item) {
    const el = document.createElement('div');
    el.className = 'item';
    el.id = `item-${item.id}`;

    // Add visual alert class if alert is triggered
    if (item.alert) {
        el.classList.add('alert-highlight');
    }

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

    // Step 4: Show or hide empty state
    if (items.length === 0) {
        emptyStateMsg.style.display = 'block';
        return;
    } else {
        emptyStateMsg.style.display = 'none';
    }

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
 * Manually refresh all item prices
 */
async function refreshAll() {
    try {
        const items = await ipcRenderer.invoke('get-watchlist');
        updateUI(items);
    } catch (err) {
        logError(`Manual refresh error: ${err.message}`);
        alert('An error occurred while refreshing the prices.');
    }
}

/**
 * Toggle auto-refresh interval
 */
function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;

    if (autoRefresh) {
        autoRefreshInterval = setInterval(refreshAll, 60000); // Refresh every 60s
        autoRefreshToggle.textContent = 'Auto-Refresh: ON';
    } else {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        autoRefreshToggle.textContent = 'Auto-Refresh: OFF';
    }
}

/**
 * Initial load
 */
window.onload = async () => {
    try {
        const items = await ipcRenderer.invoke('get-watchlist');
        updateUI(items);
    } catch (err) {
        logError(`Dashboard initial load error: ${err.message}`);
        alert('An error occurred while loading your watchlist.');
    }

    // Set up button listeners
    refreshBtn.addEventListener('click', refreshAll);
    autoRefreshToggle.addEventListener('click', toggleAutoRefresh);
};
