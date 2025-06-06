/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const { fireEvent } = require('@testing-library/dom');

// Mock the preload-exposed API
global.window.electronAPI = {
    ipcRenderer: {
        invoke: jest.fn()
    },
    logError: jest.fn()
};

// Set up a minimal DOM for modal tests
beforeEach(() => {
    document.body.innerHTML = `
      <ul id="watchlist"></ul>
      <div id="item-modal" class="hidden">
        <div class="modal-content">
          <span id="modal-close">X</span>
          <h2 id="modal-name"></h2>
          <p><span id="modal-rap"></span></p>
          <p><span id="modal-volume"></span></p>
          <p><span id="modal-description"></span></p>
          <a id="modal-link"></a>
        </div>
      </div>
    `;

    // Escape key event listener to close the modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.getElementById('item-modal').classList.add('hidden');
        }
    });

    jest.clearAllMocks();
});

// Helpers for accessing modal elements
const modal = () => document.getElementById('item-modal');
const nameField = () => document.getElementById('modal-name');
const rapField = () => document.getElementById('modal-rap');
const volumeField = () => document.getElementById('modal-volume');
const descriptionField = () => document.getElementById('modal-description');
const link = () => document.getElementById('modal-link');

// Mimic modal population logic from the app
async function openModalWithItemDetails(id) {
    const details = await window.electronAPI.ipcRenderer.invoke('get-item-details', id);

    nameField().textContent = details.name;
    rapField().textContent = details.rap;
    volumeField().textContent = details.volume;
    descriptionField().textContent = details.description;
    link().href = `https://www.rolimons.com/item/${id}`;
    link().textContent = 'View on Rolimons';

    modal().classList.remove('hidden');
}

describe('Watchlist Modal', () => {
    test('displays item details in modal when opened', async () => {
        const mockDetails = {
            name: 'Test Item',
            rap: 1000,
            volume: 500,
            description: 'A limited item.'
        };

        window.electronAPI.ipcRenderer.invoke.mockResolvedValue(mockDetails);

        await openModalWithItemDetails('123');

        expect(nameField()).toHaveTextContent('Test Item');
        expect(rapField()).toHaveTextContent('1000');
        expect(volumeField()).toHaveTextContent('500');
        expect(descriptionField()).toHaveTextContent('A limited item.');
        expect(link()).toHaveAttribute('href', 'https://www.rolimons.com/item/123');
        expect(link()).toHaveTextContent('View on Rolimons');
        expect(modal().classList.contains('hidden')).toBe(false);
    });

    test('closes modal when Escape key is pressed', () => {
        modal().classList.remove('hidden'); // simulate open

        fireEvent.keyDown(document, { key: 'Escape' });

        expect(modal().classList.contains('hidden')).toBe(true);
    });
});
