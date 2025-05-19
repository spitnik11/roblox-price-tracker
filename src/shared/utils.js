// Debounce function: delays execution of `func` until after `delay` ms have passed since the last call
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId); // Reset the timer if called again quickly
        timeoutId = setTimeout(() => func.apply(this, args), delay); // Call `func` after delay
    };
}

// Formats a number as a Roblox currency string (e.g., 1234 ? "R$1,234")
export function formatPrice(num) {
    return num ? `R$${Number(num).toLocaleString()}` : 'N/A';
}

// Cooldown wrapper: prevents `fn` from running more than once every `delay` ms
export function cooldown(fn, delay = 30000) {
    let lastCalled = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCalled >= delay) {
            lastCalled = now;
            fn(...args); // Only run if cooldown has passed
        }
    };
}
