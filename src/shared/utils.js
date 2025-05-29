// src/main/utils.js

/**
 * Debounce function: delays execution of `func` until after `delay` ms
 * have passed since the last call. Useful for limiting rapid calls (e.g., typing events).
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId); // Reset timer
        timeoutId = setTimeout(() => func.apply(this, args), delay); // Schedule new call
    };
}

/**
 * Formats a number into Roblox-style currency (e.g., 1234 -> R$1,234)
 */
function formatPrice(num) {
    return num ? `R$${Number(num).toLocaleString()}` : 'N/A';
}

/**
 * Cooldown wrapper: wraps a function to allow execution only every `delay` ms
 * Similar to debounce but enforces delay between allowed executions
 */
function cooldown(fn, delay = 30000) {
    let lastCalled = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCalled >= delay) {
            lastCalled = now;
            fn(...args);
        }
    };
}

/**
 * Legacy/global cooldown tracker (used before item-level cooldowns)
 * Can still be used for global actions like full list refresh
 */
let lastRefreshTime = 0;

function canRefresh() {
    const now = Date.now();
    if (now - lastRefreshTime >= 30000) {
        lastRefreshTime = now;
        return true;
    }
    return false;
}

// Export all utilities in CommonJS format
module.exports = {
    debounce,
    formatPrice,
    cooldown,
    canRefresh,
};
