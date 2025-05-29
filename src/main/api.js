// src/main/api.js

// Import node-fetch to make HTTP requests from the backend
const fetch = require('node-fetch');

// Load environment variables from .env file (especially the ROBLOX token)
require('dotenv').config();

// Read the .ROBLOSECURITY token from the environment
const ROBLOX_TOKEN = process.env.ROBLOX_TOKEN;

/**
 * Fetch the lowest reseller price for a given Roblox limited item.
 * Throws an error if the request fails or returns invalid data.
 */
async function fetchLimitedPrice(itemId) {
    const url = `https://economy.roblox.com/v1/assets/${itemId}/resellers`;

    try {
        const response = await fetch(url, {
            headers: {
                // Use the Roblox security token as a cookie in the request
                'Cookie': `.ROBLOSECURITY=${ROBLOX_TOKEN}`
            }
        });

        // If the response isn't OK (e.g., 403, 500), throw an error
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Attempt to parse the JSON
        const data = await response.json();

        // Extract the lowest price from the first reseller listing (if available)
        const lowest = data.data?.[0]?.price || null;

        // Return price data
        return { itemId, price: lowest };
    } catch (error) {
        // Log the error and re-throw it for tests to catch
        console.error(`Error fetching price for item ${itemId}:`, error);
        throw error;
    }
}

// Export the function
module.exports = { fetchLimitedPrice };
