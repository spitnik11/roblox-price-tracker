/**
 * Debounce function: delays execution of `func` until after `delay` ms
 * have passed since the last call. Useful for limiting rapid events (e.g., input typing).
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
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
 * Useful for rate-limiting expensive operations like fetch calls
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
 * Global refresh cooldown tracker.
 * Use for actions like full-dashboard refresh.
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

// Export for use in both renderer and main
module.exports = {
    debounce,
    formatPrice,
    cooldown,
    canRefresh,
};
