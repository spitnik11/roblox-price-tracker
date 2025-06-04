// watchlistManager.test.js
const { formatItemHTML } = require('../src/renderer/js/watchlistManager.js');

describe('formatItemHTML', () => {
    it('formats item without threshold', () => {
        const item = { id: '12345', threshold: null };
        const html = formatItemHTML(item);
        expect(html).toContain('ID: 12345');
        expect(html).not.toContain('| Threshold:'); // Corrected check
    });

    it('formats item with threshold', () => {
        const item = { id: '67890', threshold: 2500 };
        const html = formatItemHTML(item);
        expect(html).toContain('ID: 67890');
        expect(html).toContain('Threshold: 2500');
    });

    it('includes buttons', () => {
        const item = { id: '99999', threshold: 1000 };
        const html = formatItemHTML(item);
        expect(html).toContain('data-remove-id="99999"');
        expect(html).toContain('data-edit-id="99999"');
    });
});
