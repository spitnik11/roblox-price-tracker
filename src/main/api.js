const fetch = require('node-fetch');
require('dotenv').config();

const ROBLOX_TOKEN = process.env.ROBLOX_TOKEN;

/**
 * Fetch detailed pricing info for a Roblox limited item:
 * - Lowest resale price
 * - RAP (Recent Average Price)
 * - Volume
 * - Percent change vs RAP
 */
async function fetchLimitedPrice(itemId) {
    const priceUrl = `https://economy.roblox.com/v1/assets/${itemId}/resellers`;
    const infoUrl = `https://economy.roblox.com/v2/assets/${itemId}/details`;

    try {
        const [priceRes, infoRes] = await Promise.all([
            fetch(priceUrl, {
                headers: {
                    'Cookie': `.ROBLOSECURITY=${ROBLOX_TOKEN}`
                }
            }),
            fetch(infoUrl, {
                headers: {
                    'Cookie': `.ROBLOSECURITY=${ROBLOX_TOKEN}`
                }
            })
        ]);

        if (!priceRes.ok || !infoRes.ok) {
            throw new Error(`API error: ${priceRes.status}, ${infoRes.status}`);
        }

        const priceData = await priceRes.json();
        const infoData = await infoRes.json();

        const lowestPrice = priceData.data?.[0]?.price || null;
        const rap = infoData.recentAveragePrice || null;
        const volume = infoData.volume || null;

        const percentChange = (rap && lowestPrice)
            ? Number(((lowestPrice - rap) / rap) * 100).toFixed(1)
            : null;

        return {
            itemId,
            price: lowestPrice,
            rap,
            volume,
            percentChange
        };
    } catch (err) {
        console.error(`Error fetching data for item ${itemId}:`, err);
        throw err;
    }
}

/**
 * Search limited collectible items by name using Roblox Catalog API.
 * Returns simplified result: id, name, price.
 */
async function searchItemsByName(query) {
    const url = `https://catalog.roblox.com/v1/search/items/details?Keyword=${encodeURIComponent(query)}&Limit=10&Category=Collectibles&SortType=Relevance`;

    try {
        const response = await fetch(url, {
            headers: {
                'Cookie': `.ROBLOSECURITY=${ROBLOX_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();

        // Normalize to only return id, name, price
        return (data.data || []).map(item => ({
            id: item.id,
            name: item.name,
            price: item.price ?? 'N/A'
        }));
    } catch (err) {
        console.error('Search failed:', err);
        return [];
    }
}

/**
 * Fetch full economic detail of an item for modal view.
 */
async function fetchItemDetails(itemId) {
    const url = `https://economy.roblox.com/v2/assets/${itemId}/details`;

    try {
        const response = await fetch(url, {
            headers: {
                'Cookie': `.ROBLOSECURITY=${ROBLOX_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch item details: ' + response.status);
        }

        return await response.json();
    } catch (err) {
        console.error('Error in fetchItemDetails:', err);
        throw err;
    }
}

/**
 * Mock price history data generator for sparkline visualization.
 * Simulates 14 days of price data.
 */
function getMockPriceHistory(itemId) {
    const now = Date.now();
    const base = Math.floor(Math.random() * 4000 + 1000); // base price between 1000–5000

    return Array.from({ length: 14 }, (_, i) => ({
        date: new Date(now - (13 - i) * 86400000).toISOString().split('T')[0],
        price: Math.floor(base * (0.9 + Math.random() * 0.2)) // ±10% fluctuation
    }));
}

module.exports = {
    fetchLimitedPrice,
    searchItemsByName,
    fetchItemDetails,
    getMockPriceHistory
};
