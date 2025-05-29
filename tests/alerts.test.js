const { checkPriceAlert } = require('../src/main/alerts');

test('triggers alert when price drops below threshold', () => {
    const result = checkPriceAlert(500, 600);
    expect(result).toBe(true);
});

test('no alert when price equals threshold', () => {
    const result = checkPriceAlert(600, 600);
    expect(result).toBe(false);
});

test('no alert when price is higher than threshold', () => {
    const result = checkPriceAlert(700, 600);
    expect(result).toBe(false);
});
