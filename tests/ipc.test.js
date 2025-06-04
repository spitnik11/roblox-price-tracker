describe('ipcRenderer mock tests', () => {
    beforeEach(() => {
        jest.resetModules(); // Clear cache between tests

        jest.mock('electron', () => ({
            ipcRenderer: {
                invoke: jest.fn().mockResolvedValue(true),
            },
            ipcMain: {
                handle: jest.fn(),
            },
        }));
    });

    test('mock ipcRenderer.invoke works', async () => {
        // Import after mocking
        const { ipcRenderer } = require('electron');

        const result = await ipcRenderer.invoke('check-alert', {
            currentPrice: 500,
            threshold: 600,
        });

        expect(result).toBe(true);
    });
});
