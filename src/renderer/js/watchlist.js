// Access the ipcRenderer API and logger exposed by preload.js
const { ipcRenderer, logError, searchItemsByName } = window.electronAPI;

// Import utility and rendering helpers
import { debounce } from '../../shared/utils.js';
import { formatItemHTML } from './watchlistManager.js';
import { renderSparkline } from './chart.js';

// DOM references
const input = document.getElementById('item-id-input');
const belowInput = document.getElementById('below-input');
const aboveInput = document.getElementById('above-input');
const percentInput = document.getElementById('percent-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('watchlist');
const emptyStateMsg = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const toggleSound = document.getElementById('toggle-sound');
const toggleVisual = document.getElementById('toggle-visual');
const toggleTheme = document.getElementById('toggle-theme');

// Modal DOM references
const modal = document.getElementById('item-modal');
const modalClose = document.getElementById('modal-close');
const modalName = document.getElementById('modal-name');
const modalRAP = document.getElementById('modal-rap');
const modalVolume = document.getElementById('modal-volume');
const modalDescription = document.getElementById('modal-description');
const modalLink = document.getElementById('modal-link');

// Load and apply saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
toggleTheme.checked = savedTheme === 'light';

toggleTheme.addEventListener('change', () => {
    const newTheme = toggleTheme.checked ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Load alert settings
toggleSound.checked = localStorage.getItem('alertSound') === 'true';
toggleVisual.checked = localStorage.getItem('alertVisual') === 'true';

toggleSound.addEventListener('change', () => {
    localStorage.setItem('alertSound', toggleSound.checked);
});

toggleVisual.addEventListener('change', () => {
    localStorage.setItem('alertVisual', toggleVisual.checked);
});

// Snackbar for undo
const snackbar = document.createElement('div');
snackbar.id = 'undo-snackbar';
Object.assign(snackbar.style, {
    display: 'none',
    position: 'fixed',
    bottom: '10px',
    left: '10px',
    padding: '10px 20px',
    background: '#222',
    color: '#fff',
    border: '1px solid #888',
    borderRadius: '6px',
    zIndex: '1000',
    fontSize: '12px'
});
document.body.appendChild(snackbar);

function showUndoSnackbar() {
    snackbar.innerHTML = 'Item removed. <button id="undo-btn">Undo</button>';
    snackbar.style.display = 'block';

    document.getElementById('undo-btn').onclick = async () => {
        try {
            const result = await ipcRenderer.invoke('undo-remove');
            if (result.success) await renderWatchlist();
        } catch (err) {
            logError('Undo failed: ' + err.message);
        } finally {
            snackbar.style.display = 'none';
        }
    };

    setTimeout(() => snackbar.style.display = 'none', 5000);
}

// Add item
addBtn.addEventListener('click', async () => {
    try {
        const itemId = input.value.trim();
        const thresholdBelow = parseFloat(belowInput.value);
        const thresholdAbove = parseFloat(aboveInput.value);
        const percentDrop = parseFloat(percentInput.value);

        if (!itemId) return;

        await ipcRenderer.invoke('add-item', {
            id: itemId,
            thresholdBelow: isNaN(thresholdBelow) ? null : thresholdBelow,
            thresholdAbove: isNaN(thresholdAbove) ? null : thresholdAbove,
            percentDrop: isNaN(percentDrop) ? null : percentDrop
        });

        input.value = '';
        belowInput.value = '';
        aboveInput.value = '';
        percentInput.value = '';

        await renderWatchlist();
    } catch (err) {
        logError('Add item error: ' + err.message);
    }
});

input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addBtn.click();
});

// Remove, Edit, or Details
list.addEventListener('click', async (e) => {
    try {
        if (e.target.dataset.removeId) {
            if (confirm('Remove this item?')) {
                await ipcRenderer.invoke('remove-item', e.target.dataset.removeId);
                await renderWatchlist();
                showUndoSnackbar();
            }
        }

        if (e.target.dataset.editId) {
            const itemId = e.target.dataset.editId;
            const below = prompt('New Price Below:');
            const above = prompt('New Price Above:');
            const drop = prompt('New Percent Drop:');

            await ipcRenderer.invoke('edit-thresholds', {
                id: itemId,
                thresholdBelow: below ? parseFloat(below) : null,
                thresholdAbove: above ? parseFloat(above) : null,
                percentDrop: drop ? parseFloat(drop) : null
            });

            await renderWatchlist();
        }

        if (e.target.classList.contains('details-btn')) {
            const itemId = e.target.dataset.detailsId;
            const details = await ipcRenderer.invoke('get-item-details', itemId);

            modalName.textContent = details.name || 'Unknown Item';
            modalRAP.textContent = details.rap ?? 'N/A';
            modalVolume.textContent = details.volume ?? 'N/A';
            modalDescription.textContent = details.description || 'No description available.';
            modalLink.href = `https://www.rolimons.com/item/${itemId}`;
            modalLink.textContent = 'View on Rolimons';

            modal.classList.remove('hidden');
        }
    } catch (err) {
        logError('Edit/remove/details error: ' + err.message);
    }
});

// Modal close logic
modalClose.addEventListener('click', () => {
    modal.classList.add('hidden');
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.add('hidden');
});

// Debounced search input
const handleSearch = debounce(async () => {
    const query = searchInput.value.trim();
    if (query.length < 3) {
        searchResults.innerHTML = '';
        return;
    }

    try {
        const results = await searchItemsByName(query);
        renderSearchResults(results);
    } catch (err) {
        logError('Search error: ' + err.message);
    }
}, 300);

searchInput.addEventListener('input', handleSearch);

function renderSearchResults(results) {
    searchResults.innerHTML = '';

    if (results.length === 0) {
        const empty = document.createElement('li');
        empty.textContent = 'No items found.';
        empty.className = 'search-result empty';
        searchResults.appendChild(empty);
        return;
    }

    results.forEach(item => {
        const li = document.createElement('li');
        li.className = 'search-result';
        li.innerHTML = `
            ${item.name} (ID: ${item.id}) - ${item.price ? `R$${item.price}` : 'No price'}
            <button data-id="${item.id}" class="add-search-item">Add</button>
        `;
        searchResults.appendChild(li);
    });
}

searchResults.addEventListener('click', async (e) => {
    if (e.target.classList.contains('add-search-item')) {
        const id = e.target.getAttribute('data-id');
        input.value = id;
        searchResults.innerHTML = '';
    }
});

// Render Watchlist UI
async function renderWatchlist() {
    try {
        const watchlist = await ipcRenderer.invoke('get-watchlist');
        list.innerHTML = '';

        if (watchlist.length === 0) {
            emptyStateMsg.style.display = 'block';
            return;
        }

        emptyStateMsg.style.display = 'none';
        watchlist.forEach(item => {
            const el = document.createElement('li');
            el.innerHTML = formatItemHTML(item);

            const canvas = document.createElement('canvas');
            canvas.width = 80;
            canvas.height = 20;
            canvas.style.marginTop = '6px';

            const dummyPrices = Array.from({ length: 10 }, () => Math.floor(1000 + Math.random() * 200));
            renderSparkline(canvas, dummyPrices);

            el.appendChild(canvas);
            list.appendChild(el);
        });
    } catch (err) {
        logError('Render watchlist error: ' + err.message);
    }
}

window.onload = renderWatchlist;
