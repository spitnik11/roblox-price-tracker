/**
 * Check if a price alert should be triggered based on current price and thresholds.
 * Supports:
 * - thresholdBelow: price drops below value
 * - thresholdAbove: price rises above value
 * - percentDrop: price drops by % compared to RAP
 */
function checkPriceAlert({ price, rap, thresholdBelow, thresholdAbove, percentDrop }) {
    if (typeof price !== 'number') return false;

    // Below threshold check
    if (typeof thresholdBelow === 'number' && price < thresholdBelow) {
        return true;
    }

    // Above threshold check
    if (typeof thresholdAbove === 'number' && price > thresholdAbove) {
        return true;
    }

    // Percent drop check (e.g. alert if price is 15% lower than RAP)
    if (
        typeof percentDrop === 'number' &&
        typeof rap === 'number' &&
        rap > 0 &&
        ((rap - price) / rap) * 100 >= percentDrop
    ) {
        return true;
    }

    return false;
}

module.exports = { checkPriceAlert };
