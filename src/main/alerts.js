// Check if a price alert should be triggered based on current price and user-defined threshold
function checkPriceAlert(currentPrice, threshold) {
    // Ensure both values are valid numbers before comparing
    if (typeof currentPrice !== 'number' || typeof threshold !== 'number') return false;

    // Trigger alert only if current price is strictly less than the threshold
    return currentPrice < threshold;
}

// Export the function for use in other modules (like during price updates)
module.exports = { checkPriceAlert };
