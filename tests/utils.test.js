const { debounce, cooldown } = require('../src/shared/utils.js');

jest.useFakeTimers();

test('debounce delays function execution', () => {
    const mockFn = jest.fn();
    const debounced = debounce(mockFn, 300);

    debounced();
    debounced(); // called twice, should only execute once after delay

    jest.advanceTimersByTime(299);
    expect(mockFn).not.toBeCalled();

    jest.advanceTimersByTime(1);
    expect(mockFn).toBeCalledTimes(1);
});

test('cooldown function prevents repeated calls too fast', () => {
    const mockFn = jest.fn();
    const wrapped = cooldown(mockFn, 1000);

    wrapped(); // should call
    wrapped(); // too fast, should not call

    jest.advanceTimersByTime(999);
    wrapped(); // still too early

    jest.advanceTimersByTime(1);
    wrapped(); // now OK

    expect(mockFn).toBeCalledTimes(2);
});
