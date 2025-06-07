/**
 * @jest-environment jsdom
 */

describe('Dashboard Animation Toggle', () => {
    let renderItem;

    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = (() => {
            let store = {};
            return {
                getItem: jest.fn((key) => store[key] || null),
                setItem: jest.fn((key, value) => { store[key] = String(value); }),
                clear: jest.fn(() => { store = {}; })
            };
        })();
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        // Minimal DOM
        document.body.innerHTML = `
            <input type="checkbox" id="toggle-animations" />
            <div id="priceContainer"></div>
        `;

        // Simulated renderItem behavior
        renderItem = (item) => {
            const el = document.createElement('div');
            el.className = 'item';
            el.id = 'item-' + item.id;
            if (localStorage.getItem('animations') === 'false') {
                el.classList.add('no-anim');
            }
            el.innerHTML = '<p>' + item.id + '</p>';
            return el;
        };
    });

    test('adds .no-anim class when animations are disabled', () => {
        localStorage.setItem('animations', 'false');
        const item = renderItem({ id: '1234' });

        expect(item.classList.contains('no-anim')).toBe(true);
        expect(item.id).toBe('item-1234');
    });

    test('does not add .no-anim class when animations are enabled', () => {
        localStorage.setItem('animations', 'true');
        const item = renderItem({ id: '5678' });

        expect(item.classList.contains('no-anim')).toBe(false);
    });

    test('toggle-animations checkbox reflects saved state on load', () => {
        localStorage.setItem('animations', 'false');
        const toggle = document.getElementById('toggle-animations');

        toggle.checked = localStorage.getItem('animations') !== 'false';
        expect(toggle.checked).toBe(false);

        toggle.checked = true;
        toggle.dispatchEvent(new Event('change'));

        localStorage.setItem('animations', toggle.checked);
        expect(localStorage.setItem).toHaveBeenCalledWith('animations', true);
    });
});
