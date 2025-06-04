// watchlist.js

// Access the ipcRenderer API exposed through the preload script
const { ipcRenderer, logError } = window.electronAPI;

// Import formatting function
import { formatItemHTML } from './watchlistManager.js';

// Get references to the input, button, and list elements from the HTML
const input = document.getElementById('item-id-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('watchlist');
const emptyStateMsg = document.getElementById('empty-state'); // Empty state element

// Create undo snackbar element
const snackbar = document.createElement('div');
snackbar.id = 'undo-snackbar';
snackbar.style.display = 'none';
snackbar.style.position = 'fixed';
snackbar.style.bottom = '10px';
snackbar.style.left = '10px';
snackbar.style.padding = '10px 20px';
snackbar.style.background = '#222';
snackbar.style.color = '#fff';
snackbar.style.border = '1px solid #888';
snackbar.style.borderRadius = '6px';
snackbar.style.zIndex = '1000';
snackbar.style.fontSize = '12px';
document.body.appendChild(snackbar);

// Show undo notification
function showUndoSnackbar() {
    snackbar.innerHTML = 'Item removed. <button id="undo-btn">Undo</button>';
    snackbar.style.display = 'block';

    document.getElementById('undo-btn').onclick = async () => {
        try {
            const result = await ipcRenderer.invoke('undo-remove');
            if (result.success) {
                await renderWatchlist();
            } else {
                alert('No item to undo.');
            }
        } catch (err) {
            logError(`Undo failed: ${err.message}`);
        } finally {
            snackbar.style.display = 'none';
        }
    };

    setTimeout(() => {
        snackbar.style.display = 'none';
    }, 5000);
}

// Handle the "Add" button click
addBtn.addEventListener('click', async () => {
    try {
        const itemId = input.value.trim();
        if (!itemId) return;

        await ipcRenderer.invoke('add-item', itemId);
        input.value = '';
        await renderWatchlist();
    } catch (err) {
        logError(`Add button error: ${err.message}`);
    }
});

// Keyboard: Enter key submits input
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addBtn.click();
    }
});

// Handle clicks on the watchlist (remove/edit)
list.addEventListener('click', async (e) => {
    try {
        if (e.target.dataset.removeId) {
            const confirmDelete = confirm('Are you sure you want to remove this item?');
            if (confirmDelete) {
                await ipcRenderer.invoke('remove-item', e.target.dataset.removeId);
                await renderWatchlist();
                showUndoSnackbar();
            }
        }

        if (e.target.dataset.editId) {
            const itemId = e.target.dataset.editId;
            const newThreshold = prompt('Enter new threshold price:');
            if (newThreshold && !isNaN(Number(newThreshold))) {
                await ipcRenderer.invoke('edit-threshold', {
                    id: itemId,
                    threshold: Number(newThreshold)
                });
                await renderWatchlist();
            }
        }
    } catch (err) {
        logError(`Watchlist click error: ${err.message}`);
    }
});

// Fetch and display the current watchlist
async function renderWatchlist() {
    try {
        const watchlist = await ipcRenderer.invoke('get-watchlist');
        list.innerHTML = '';

        if (watchlist.length === 0) {
            emptyStateMsg.style.display = 'block';
            return;
        } else {
            emptyStateMsg.style.display = 'none';
        }

        watchlist.forEach(item => {
            const el = document.createElement('li');
            el.innerHTML = formatItemHTML(item);
            list.appendChild(el);
        });
    } catch (err) {
        logError(`Render watchlist error: ${err.message}`);
    }
}

// Initial render
window.onload = renderWatchlist;
