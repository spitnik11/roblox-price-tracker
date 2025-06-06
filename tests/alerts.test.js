/**
 * Unit tests for checkPriceAlert
 * - Tests all threshold types: below, above, percentDrop
 * - Covers valid, edge, and invalid input cases
 */

const { checkPriceAlert } = require('../src/main/alerts');

describe('checkPriceAlert()', () => {
    test('triggers alert when price drops below thresholdBelow', () => {
        const config = { price: 500, thresholdBelow: 600 };
        expect(checkPriceAlert(config)).toBe(true);
    });

    test('does not trigger alert when price equals thresholdBelow', () => {
        const config = { price: 600, thresholdBelow: 600 };
        expect(checkPriceAlert(config)).toBe(false);
    });

    test('triggers alert when price rises above thresholdAbove', () => {
        const config = { price: 1100, thresholdAbove: 1000 };
        expect(checkPriceAlert(config)).toBe(true);
    });

    test('does not trigger alert when price equals thresholdAbove', () => {
        const config = { price: 1000, thresholdAbove: 1000 };
        expect(checkPriceAlert(config)).toBe(false);
    });

    test('triggers alert on percent drop compared to RAP', () => {
        const config = { price: 800, rap: 1000, percentDrop: 15 }; // 20% drop
        expect(checkPriceAlert(config)).toBe(true);
    });

    test('does not trigger percentDrop alert if drop is too small', () => {
        const config = { price: 950, rap: 1000, percentDrop: 10 }; // only 5% drop
        expect(checkPriceAlert(config)).toBe(false);
    });

    test('ignores invalid price or rap types', () => {
        expect(checkPriceAlert({ price: 'bad', thresholdBelow: 1000 })).toBe(false);
        expect(checkPriceAlert({ price: 900, rap: 'oops', percentDrop: 20 })).toBe(false);
    });

    test('ignores when no thresholds are provided', () => {
        expect(checkPriceAlert({ price: 1000 })).toBe(false);
    });

    test('handles 0 and negative values correctly', () => {
        expect(checkPriceAlert({ price: 0, thresholdBelow: 1 })).toBe(true);
        expect(checkPriceAlert({ price: -100, thresholdBelow: 0 })).toBe(true);
        expect(checkPriceAlert({ price: 0, thresholdAbove: -1 })).toBe(true);
        expect(checkPriceAlert({ price: 900, rap: 1000, percentDrop: 0 })).toBe(true); // any drop triggers
    });

    test('returns false if price is not a number', () => {
        expect(checkPriceAlert({ price: null, thresholdBelow: 500 })).toBe(false);
        expect(checkPriceAlert({ price: undefined, thresholdAbove: 500 })).toBe(false);
    });
});
