const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix: three.js package exports field references non-existent
// loader files. Disabling unstable_enablePackageExports forces
// Metro to use classic file-based resolution, eliminating the
// invalid package.json warnings while keeping all functionality.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
