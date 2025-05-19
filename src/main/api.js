// src/main/api.js

// Import node-fetch to make HTTP requests from the backend
const fetch = require('node-fetch');

// Load environment variables from .env file (especially the ROBLOX token)
require('dotenv').config();

// Read the .ROBLOSECURITY token from the environment
const ROBLOX_TOKEN = process.env.ROBLOX_TOKEN;

// Fetch the lowest reseller price for a given Roblox limited item
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
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // Parse the JSON response
        const data = await response.json();

        // Grab the lowest price from the first reseller listing (if available)
        const lowest = data.data?.[0]?.price || null;

        // Return the itemId and its lowest price
        return { itemId, price: lowest };
    } catch (error) {
        // Log and return any errors that occurred
        console.error(`Error fetching price for item ${itemId}:`, error);
        return { itemId, error: error.message };
    }
}

// Export the function for use in other backend modules
module.exports = { fetchLimitedPrice };
