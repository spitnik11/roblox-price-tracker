/**
 * Unit tests for fetchLimitedPrice:
 * - Mocks fetch() for API responses and errors
 * - Tests for correct price return, JSON parse failure, and HTTP error handling
 */

const { fetchLimitedPrice } = require('../src/main/api');

// Silence console.error during tests
beforeEach(() => {
    fetch.resetMocks();
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

test('fetchLimitedPrice returns correct price data', async () => {
    const priceResponse = { data: [{ price: 1234 }] };
    const infoResponse = { recentAveragePrice: 1500 };

    fetch
        .mockResponseOnce(JSON.stringify(priceResponse)) // price
        .mockResponseOnce(JSON.stringify(infoResponse)); // rap

    const result = await fetchLimitedPrice(1111);

    expect(result).toEqual({
        itemId: 1111,
        price: 1234,
        rap: 1500,
        percentChange: "-17.7",
        volume: null
    });
});

test('fetchLimitedPrice returns null percentChange when price is null', async () => {
    const priceResponse = { data: [] }; // no reseller
    const infoResponse = { recentAveragePrice: 1500 };

    fetch
        .mockResponseOnce(JSON.stringify(priceResponse))
        .mockResponseOnce(JSON.stringify(infoResponse));

    const result = await fetchLimitedPrice(2222);

    expect(result).toEqual({
        itemId: 2222,
        price: null,
        rap: 1500,
        percentChange: null,
        volume: null
    });
});

test('fetchLimitedPrice returns null percentChange when rap is null', async () => {
    const priceResponse = { data: [{ price: 1234 }] };
    const infoResponse = {}; // missing RAP

    fetch
        .mockResponseOnce(JSON.stringify(priceResponse))
        .mockResponseOnce(JSON.stringify(infoResponse));

    const result = await fetchLimitedPrice(3333);

    expect(result).toEqual({
        itemId: 3333,
        price: 1234,
        rap: null,
        percentChange: null,
        volume: null
    });
});

test('fetchLimitedPrice throws on fetch rejection', async () => {
    fetch.mockReject(() => Promise.reject(new Error("API error")));

    await expect(fetchLimitedPrice(1234)).rejects.toThrow("API error");
});

test('fetchLimitedPrice throws on invalid JSON in price response', async () => {
    fetch
        .mockResponseOnce('invalid json', { status: 200 })
        .mockResponseOnce(JSON.stringify({ recentAveragePrice: 1500 }));

    await expect(fetchLimitedPrice(2222)).rejects.toThrow();
});

test('fetchLimitedPrice throws on 404 response', async () => {
    fetch
        .mockResponseOnce('', { status: 404 })
        .mockResponseOnce('', { status: 200 });

    await expect(fetchLimitedPrice(4444)).rejects.toThrow("API error: 404, 200");
});

test('fetchLimitedPrice throws on bad info response JSON', async () => {
    fetch
        .mockResponseOnce(JSON.stringify({ data: [{ price: 1234 }] }))
        .mockResponseOnce('invalid json');

    await expect(fetchLimitedPrice(5555)).rejects.toThrow();
});

test('fetchLimitedPrice throws when both responses are 404', async () => {
    fetch
        .mockResponseOnce('', { status: 404 })
        .mockResponseOnce('', { status: 404 });

    await expect(fetchLimitedPrice(6666)).rejects.toThrow("API error: 404, 404");
});
