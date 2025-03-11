(window as any).Stream = require('stream-browserify');
window.global = window;

// process.env.ANCHOR_BROWSER = true

(window as any).process = {
  env: {
    ANCHOR_BROWSER: true,
  },
} as any;
