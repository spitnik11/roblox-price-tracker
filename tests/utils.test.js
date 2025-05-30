// Import all utility functions from shared utils
const { debounce, cooldown, formatPrice, canRefresh } = require('../src/shared/utils.js');

jest.useFakeTimers();

test('debounce delays function execution', () => {
    const mockFn = jest.fn();
    const debounced = debounce(mockFn, 300);

    debounced();
    debounced(); // called twice, should only execute once after delay

    jest.advanceTimersByTime(299);
    expect(mockFn).not.toBeCalled();

    jest.advanceTimersByTime(1);
    expect(mockFn).toBeCalledTimes(1);
});

test('cooldown function prevents repeated calls too fast', () => {
    const mockFn = jest.fn();
    const wrapped = cooldown(mockFn, 1000);

    wrapped(); // should call
    wrapped(); // too fast, should not call

    jest.advanceTimersByTime(999);
    wrapped(); // still too early

    jest.advanceTimersByTime(1);
    wrapped(); // now OK

    expect(mockFn).toBeCalledTimes(2);
});

test('formatPrice returns N/A for falsy values', () => {
    expect(formatPrice(null)).toBe('N/A');
    expect(formatPrice(0)).toBe('N/A');
    expect(formatPrice(undefined)).toBe('N/A');
});

test('formatPrice formats valid number correctly', () => {
    expect(formatPrice(1234)).toBe('R$1,234');
    expect(formatPrice(5000000)).toBe('R$5,000,000');
});

test('canRefresh enforces 30s cooldown between calls', () => {
    expect(canRefresh()).toBe(true);   // First call should be allowed
    expect(canRefresh()).toBe(false);  // Immediate second call should fail

    jest.advanceTimersByTime(29000);
    expect(canRefresh()).toBe(false);  // Still too early

    jest.advanceTimersByTime(1000);    // Total 30s passed
    expect(canRefresh()).toBe(true);   // Now allowed again
});
