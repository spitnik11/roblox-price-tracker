// jest.setup.js

// Enable fetch mocking
require('jest-fetch-mock').enableMocks();

// Polyfill for jsdom compatibility (fixes "TextEncoder is not defined")
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
