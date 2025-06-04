const mock = require('mock-fs');
const path = require('path');

describe('watchlistManager', () => {
    let watchlist;

    const watchlistPath = path.join(__dirname, '../../data/watchlist.json');

    beforeEach(() => {
        // Mock an empty watchlist file in memory
        mock({
            [watchlistPath]: '{}'
        });

        // Ensure fresh module reload after FS mock
        jest.resetModules();

        // Direct relative import (no alias)
        watchlist = require('../src/shared/watchlistManager');
    });

    afterEach(() => {
        mock.restore();
    });

    test('adds an item and persists it', () => {
        watchlist.addItem('123', 1000);
        const items = watchlist.getWatchlist();
        expect(items).toHaveLength(1);
        expect(items[0]).toEqual({ id: '123', threshold: 1000 });
    });

    test('throws error on duplicate item', () => {
        watchlist.addItem('abc', 500);
        expect(() => watchlist.addItem('abc', 999)).toThrow('Item already exists in watchlist');
    });

    test('removes an item from the watchlist', () => {
        watchlist.addItem('del', 800);
        watchlist.removeItem('del');
        expect(watchlist.getWatchlist()).toHaveLength(0);
    });

    test('undo restores last removed item', () => {
        watchlist.addItem('undo', 1500);
        watchlist.removeItem('undo');
        const restored = watchlist.undoLastRemove();
        expect(restored).toEqual({ id: 'undo', threshold: 1500 });
        expect(watchlist.getWatchlist()).toHaveLength(1);
    });

    test('undo returns null if nothing to undo', () => {
        expect(watchlist.undoLastRemove()).toBeNull();
    });

    test('updates threshold of an existing item', () => {
        watchlist.addItem('999', 100);
        watchlist.updateThreshold('999', 777);
        const updated = watchlist.getItem('999');
        expect(updated.threshold).toBe(777);
    });

    test('getItem returns correct item or null', () => {
        watchlist.addItem('one', 111);
        expect(watchlist.getItem('one')).toEqual({ id: 'one', threshold: 111 });
        expect(watchlist.getItem('not-there')).toBeNull();
    });

    test('throws error when updating non-existent item', () => {
        expect(() => {
            watchlist.updateThreshold('missing', 1234);
        }).toThrow('Item not found in watchlist');
    });
});
