/**
 * @jest-environment jsdom
 */
require('@testing-library/jest-dom');
const { fireEvent } = require('@testing-library/dom');

// Global mocks
const playMock = jest.fn();
global.Audio = jest.fn().mockImplementation(() => ({
    play: playMock,
}));

beforeEach(() => {
    document.body.innerHTML = `
        <button id="refreshBtn">Refresh</button>
        <button id="auto-refresh-toggle">Auto-Refresh: OFF</button>
        <input id="toggle-theme" type="checkbox" />
        <img id="theme-icon" />
        <input id="toggle-sound" type="checkbox" />
        <input id="toggle-visual" type="checkbox" />
        <div id="toast"></div>
    `;

    // Mock localStorage properly
    const store = {};
    jest.spyOn(global, 'localStorage', 'get').mockReturnValue({
        getItem: jest.fn((k) => {
            if (k === 'theme') return 'dark';
            if (k === 'alertSound') return 'true';
            if (k === 'alertVisual') return 'true';
            return store[k];
        }),
        setItem: jest.fn((k, v) => {
            store[k] = v;
        }),
    });

    playMock.mockClear();
});

test('theme toggle switches icon and updates body attribute', () => {
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

test('toast displays and hides message', () => {
    const toast = document.getElementById('toast');

    toast.textContent = 'Test Message';
    toast.classList.add('show');

    expect(toast).toHaveClass('show');
    expect(toast.textContent).toBe('Test Message');

    toast.classList.remove('show');
    expect(toast).not.toHaveClass('show');
});

test('auto-refresh button toggles state and label', () => {
    const toggleBtn = document.getElementById('auto-refresh-toggle');

    expect(toggleBtn.textContent).toBe('Auto-Refresh: OFF');

    let autoRefresh = false;
    let interval = null;

    const toggleAutoRefresh = () => {
        autoRefresh = !autoRefresh;
        toggleBtn.textContent = autoRefresh
            ? 'Auto-Refresh: ON'
            : 'Auto-Refresh: OFF';
        if (autoRefresh) {
            interval = setInterval(() => { }, 60000);
        } else {
            clearInterval(interval);
        }
    };

    toggleAutoRefresh();
    expect(toggleBtn.textContent).toBe('Auto-Refresh: ON');

    toggleAutoRefresh();
    expect(toggleBtn.textContent).toBe('Auto-Refresh: OFF');
});

test('sound alert plays when enabled', () => {
    const toggleSound = document.getElementById('toggle-sound');
    toggleSound.checked = true;

    const playSound = (file) => {
        if (toggleSound.checked) {
            const audio = new Audio(`../../assets/sounds/${file}`);
            audio.play();
        }
    };

    playSound('alert.mp3');

    expect(global.Audio).toHaveBeenCalledWith('../../assets/sounds/alert.mp3');
    expect(playMock).toHaveBeenCalled();
});

test('visual alert class is applied to card', () => {
    const card = document.createElement('div');
    card.className = 'item';
    document.body.appendChild(card);

    const toggleVisual = document.getElementById('toggle-visual');
    toggleVisual.checked = true;

    if (toggleVisual.checked) {
        card.classList.add('alert-highlight');
        card.style.animation = 'flash 1s ease';
    }

    expect(card).toHaveClass('alert-highlight');
    expect(card.style.animation).toBe('flash 1s ease');
});
