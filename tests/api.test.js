/**
 * Unit tests for fetchLimitedPrice:
 * - Mocks fetch() for API responses and errors
 * - Tests for correct price return, JSON parse failure, and HTTP error handling
 */

const { fetchLimitedPrice } = require('../src/main/api');

beforeEach(() => {
    fetch.resetMocks();
    jest.spyOn(console, 'error').mockImplementation(() => { }); // suppress console.error
});

test('fetchLimitedPrice returns correct price data', async () => {
    const mockApiResponse = {
        data: [{ price: 1234 }]
    };
    fetch.mockResponseOnce(JSON.stringify(mockApiResponse));

    const result = await fetchLimitedPrice(1111);
    expect(result).toEqual({
        itemId: 1111,
        price: 1234
    });
});

test('fetchLimitedPrice handles rejected fetch (API error)', async () => {
    fetch.mockReject(() => Promise.reject(new Error("API error")));

    await expect(fetchLimitedPrice(1234)).rejects.toThrow("API error");
});

test('fetchLimitedPrice throws on invalid JSON', async () => {
    fetch.mockResponseOnce('invalid json', { status: 200 });

    await expect(fetchLimitedPrice(2222)).rejects.toThrow();
});

test('fetchLimitedPrice throws on 404 status', async () => {
    fetch.mockResponseOnce('', { status: 404 });

    await expect(fetchLimitedPrice(3333)).rejects.toThrow("HTTP error");
});

test('fetchLimitedPrice throws on bad JSON again', async () => {
    fetch.mockResponseOnce('invalid json', { status: 200 });

    await expect(fetchLimitedPrice(123)).rejects.toThrow();
});

test('fetchLimitedPrice throws again on 404', async () => {
    fetch.mockResponseOnce('', { status: 404 });

    await expect(fetchLimitedPrice(123)).rejects.toThrow();
});
