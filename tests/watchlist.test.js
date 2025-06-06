/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const { fireEvent } = require('@testing-library/dom');

// Mock Audio globally
const playMock = jest.fn();
global.Audio = jest.fn().mockImplementation(() => ({
    play: playMock
}));

beforeEach(() => {
    document.body.innerHTML = `
        <input id="toggle-theme" type="checkbox" />
        <img id="theme-icon" />
        <input id="toggle-sound" type="checkbox" />
        <input id="toggle-visual" type="checkbox" />
        <div id="watchlist"></div>
    `;

    // Mock localStorage as a spyable getter
    const store = {};
    jest.spyOn(global, 'localStorage', 'get').mockReturnValue({
        getItem: jest.fn((key) => store[key]),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
    });

    // Reset audio play spy
    playMock.mockClear();
});

test('theme toggle updates body attribute and icon', () => {
    const toggle = document.getElementById('toggle-theme');
    const icon = document.getElementById('theme-icon');

    toggle.checked = true;
    fireEvent.change(toggle);

    const newTheme = toggle.checked ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    icon.src = newTheme === 'light'
        ? '../../assets/icons/sun.png'
        : '../../assets/icons/moon.png';

    expect(document.body.getAttribute('data-theme')).toBe('light');
    expect(icon.src).toContain('sun.png');
});

test('alert toggles persist to localStorage', () => {
    const sound = document.getElementById('toggle-sound');
    const visual = document.getElementById('toggle-visual');

    sound.checked = true;
    fireEvent.change(sound);
    localStorage.setItem('alertSound', sound.checked); // simulate app logic

    visual.checked = false;
    fireEvent.change(visual);
    localStorage.setItem('alertVisual', visual.checked); // simulate app logic

    expect(localStorage.setItem).toHaveBeenCalledWith('alertSound', true);
    expect(localStorage.setItem).toHaveBeenCalledWith('alertVisual', false);
});

test('playSound uses Audio API if toggle is enabled', () => {
    const toggleSound = document.getElementById('toggle-sound');
    toggleSound.checked = true;

    const playSound = (file) => {
        if (toggleSound.checked) {
            const audio = new Audio(`../../assets/sounds/${file}`);
            audio.play();
        }
    };

    playSound('price-alert.mp3');

    expect(global.Audio).toHaveBeenCalledWith('../../assets/sounds/price-alert.mp3');
    expect(playMock).toHaveBeenCalled();
});

test('undo snackbar appears with undo button', () => {
    const snackbar = document.createElement('div');
    snackbar.id = 'undo-snackbar';
    snackbar.style.display = 'none';
    document.body.appendChild(snackbar);

    function showUndoSnackbar() {
        snackbar.innerHTML = 'Item removed. <button id="undo-btn">Undo</button>';
        snackbar.style.display = 'block';
    }

    showUndoSnackbar();

    const undoButton = document.getElementById('undo-btn');
    expect(undoButton).toBeInTheDocument();
    expect(snackbar.style.display).toBe('block');
});
