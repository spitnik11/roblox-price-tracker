// Access the ipcRenderer API and logger exposed by preload.js
const { ipcRenderer, logError } = window.electronAPI;
import { formatPrice } from '../../shared/utils.js';
import sparkline from 'sparkline';

// DOM elements
const itemsContainer = document.getElementById('priceContainer');
const refreshBtn = document.getElementById('refreshBtn');
const autoRefreshToggle = document.getElementById('auto-refresh-toggle');
const emptyStateMsg = document.getElementById('empty-state');

// Modal elements
const modal = document.getElementById('details-modal');
const modalClose = document.getElementById('modal-close');
const modalName = document.getElementById('modal-name');
const modalCreator = document.getElementById('modal-creator');
const modalDescription = document.getElementById('modal-description');
const modalRAP = document.getElementById('modal-rap');
const modalVolume = document.getElementById('modal-volume');
const modalThumbnail = document.getElementById('modal-thumbnail');
const modalLink = document.getElementById('modal-link');

// Theme & alert toggles
const toggleTheme = document.getElementById('toggle-theme');
const toggleSound = document.getElementById('toggle-sound');
const toggleVisual = document.getElementById('toggle-visual');
const themeIcon = document.getElementById('theme-icon');

// Toast element
const toast = document.getElementById('toast');
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    toast.style.cursor = 'pointer';

    const hideToast = () => {
        toast.classList.remove('show');
        toast.removeEventListener('click', hideToast);
    };

    toast.addEventListener('click', hideToast);
    setTimeout(hideToast, 3000);
}

// Sound helper
function playSound(file) {
    if (toggleSound?.checked) {
        const audio = new Audio(`../../assets/sounds/${file}`);
        audio.play().catch(err => logError('Sound error: ' + err.message));
    }
}

// Theme handling
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
toggleTheme.checked = savedTheme === 'light';
themeIcon.src = savedTheme === 'light'
    ? '../../assets/icons/sun.png'
    : '../../assets/icons/moon.png';

toggleTheme.addEventListener('change', () => {
    const newTheme = toggleTheme.checked ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeIcon.src = newTheme === 'light'
        ? '../../assets/icons/sun.png'
        : '../../assets/icons/moon.png';
});

// Alert preference syncing
toggleSound.checked = localStorage.getItem('alertSound') === 'true';
toggleVisual.checked = localStorage.getItem('alertVisual') === 'true';

toggleSound.addEventListener('change', () => {
    localStorage.setItem('alertSound', toggleSound.checked);
});
toggleVisual.addEventListener('change', () => {
    localStorage.setItem('alertVisual', toggleVisual.checked);
});

// Auto-refresh state
let autoRefresh = false;
let autoRefreshInterval = null;

// Price history
const priceHistoryCache = {};
function updateHistory(id, price) {
    if (!priceHistoryCache[id]) priceHistoryCache[id] = [];
    priceHistoryCache[id].push(price);
    if (priceHistoryCache[id].length > 10) {
        priceHistoryCache[id] = priceHistoryCache[id].slice(-10);
    }
}

// Render a single item card
function renderItem(item) {
    const el = document.createElement('div');
    el.className = 'item';
    el.id = `item-${item.id}`;

    if (item.alert) el.classList.add('alert-highlight');

    el.innerHTML = `
        <p><strong>ID:</strong> ${item.id}</p>
        <p id="price-${item.id}">Price: ${formatPrice(item.price)}</p>
        <p id="rap-${item.id}">RAP: ${item.rap !== null ? formatPrice(item.rap) : 'N/A'}</p>
        <p id="change-${item.id}">% Change: ${item.percentChange !== null ? item.percentChange + '%' : 'N/A'}</p>
        <p id="volume-${item.id}">Volume: ${item.volume ?? 'N/A'}</p>
        <canvas id="chart-${item.id}" width="100" height="30"></canvas>
        ${item.alert ? '<span class="alert">Price Drop!</span>' : ''}
        <button class="refresh-one" data-id="${item.id}">Refresh</button>
        <button class="details-btn" data-id="${item.id}">Details</button>
    `;
    return el;
}

// Refresh UI
async function updateUI(watchlist) {
    itemsContainer.innerHTML = '';

    if (!watchlist || watchlist.length === 0) {
        emptyStateMsg.style.display = 'block';
        return;
    } else {
        emptyStateMsg.style.display = 'none';
    }

    const enrichedItems = await Promise.all(
        watchlist.map(async (item) => {
            try {
                const data = await ipcRenderer.invoke('refresh-data', item.id);
                updateHistory(item.id, data.price);

                const thresholds = await ipcRenderer.invoke('get-item-thresholds', item.id);
                const alert = await ipcRenderer.invoke('check-alerts', { ...data, id: item.id }, thresholds);

                return { ...item, ...data, history: priceHistoryCache[item.id] || [], alert };
            } catch (err) {
                logError(`Failed to load price for ${item.id}: ${err.message}`);
                return { ...item, price: null, rap: null, percentChange: null, volume: null, history: [], alert: false };
            }
        })
    );

    enrichedItems.forEach(item => {
        const el = renderItem(item);
        itemsContainer.appendChild(el);

        const card = el;

        if (item.alert) {
            if (toggleVisual?.checked) {
                card.classList.add('alert-highlight');
                card.style.animation = 'flash 1s ease';
                setTimeout(() => card.style.animation = '', 1000);
                showToast(`Alert triggered for item ${item.id}`);
            }
            if (toggleSound?.checked) {
                playSound('price-alert.mp3');
            }
        }

        if (item.history.length > 1) {
            const canvas = document.getElementById(`chart-${item.id}`);
            sparkline(item.history, { canvas });
        }
    });

    document.querySelectorAll('.refresh-one').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const itemId = e.target.dataset.id;
            try {
                const data = await ipcRenderer.invoke('refresh-data', itemId);
                if (data.error) return alert(data.error);

                updateHistory(itemId, data.price);
                const thresholds = await ipcRenderer.invoke('get-item-thresholds', itemId);
                const alert = await ipcRenderer.invoke('check-alerts', { ...data, id: itemId }, thresholds);

                document.getElementById(`price-${itemId}`).innerText = 'Price: ' + formatPrice(data.price);
                document.getElementById(`rap-${itemId}`).innerText = 'RAP: ' + formatPrice(data.rap);
                document.getElementById(`change-${itemId}`).innerText = '% Change: ' + (data.percentChange ?? 'N/A') + '%';
                document.getElementById(`volume-${itemId}`).innerText = 'Volume: ' + (data.volume ?? 'N/A');
                sparkline(priceHistoryCache[itemId], { canvas: document.getElementById(`chart-${itemId}`) });

                const card = document.getElementById(`item-${itemId}`);
                if (alert && toggleVisual?.checked) {
                    card.classList.add('alert-highlight');
                    showToast(`Price alert: ${itemId}`);
                    playSound('price-alert.mp3');
                } else {
                    card.classList.remove('alert-highlight');
                }
            } catch (err) {
                logError(`Refresh failed for item ${itemId}: ${err.message}`);
                alert('Error refreshing item.');
            }
        });
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const itemId = e.target.dataset.id;
            try {
                const data = await ipcRenderer.invoke('get-item-details', itemId);
                if (data.error) return alert(data.error);

                modalName.textContent = data.name || 'N/A';
                modalCreator.textContent = 'Creator: ' + (data.creator?.name || 'Unknown');
                modalDescription.textContent = data.description || '';
                modalRAP.textContent = 'RAP: ' + (data.recentAveragePrice ?? 'N/A');
                modalVolume.textContent = 'Volume: ' + (data.volume ?? 'N/A');
                modalThumbnail.src = `https://www.roblox.com/asset-thumbnail/image?assetId=${itemId}&width=150&height=150&format=png`;
                modalLink.href = `https://www.roblox.com/catalog/${itemId}`;
                modal.style.display = 'flex';
            } catch (err) {
                logError(`Detail modal error: ${err.message}`);
                alert('Error loading item details.');
            }
        });
    });
}

// Manual refresh
async function refreshAll() {
    try {
        const watchlist = await ipcRenderer.invoke('get-watchlist');
        await updateUI(watchlist);
    } catch (err) {
        logError('Refresh all error: ' + err.message);
        alert('Error refreshing items.');
    }
}

// Auto-refresh toggle
function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;
    if (autoRefresh) {
        autoRefreshInterval = setInterval(refreshAll, 60000);
        autoRefreshToggle.textContent = 'Auto-Refresh: ON';
    } else {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
        autoRefreshToggle.textContent = 'Auto-Refresh: OFF';
    }
}

// Page load
window.onload = async () => {
    try {
        const watchlist = await ipcRenderer.invoke('get-watchlist');
        await updateUI(watchlist);
    } catch (err) {
        logError('Initial load error: ' + err.message);
        alert('Error loading watchlist.');
    }

    refreshBtn.addEventListener('click', refreshAll);
    autoRefreshToggle.addEventListener('click', toggleAutoRefresh);

    modalClose.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
};
