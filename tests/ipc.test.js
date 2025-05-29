jest.mock('electron', () => ({
    ipcMain: {
        handle: jest.fn(),
    },
    ipcRenderer: {
        invoke: jest.fn().mockResolvedValue(true),
    },
}));

const { ipcRenderer } = require('electron');

test('mock ipcRenderer.invoke works', async () => {
    const result = await ipcRenderer.invoke('check-alert', { currentPrice: 500, threshold: 600 });
    expect(result).toBe(true);
});
