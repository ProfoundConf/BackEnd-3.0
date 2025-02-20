module.exports = {
    env: {
      browser: true,   // Enables browser globals like `window` and `document`
      es2021: true,    // Sets the ECMAScript version to 2021
      node: true       // Enables Node.js global variables like `require`
    },
    extends: [
      "eslint:recommended" // Use the recommended rules from ESLint
    ],
    parserOptions: {
      ecmaVersion: 12,      // Allow parsing of modern ECMAScript features
      sourceType: "module"  // Allow usage of ES6 modules
    },
    rules: {
      // Customize rules here
      "no-undef": "error",  // Disallow use of undeclared variables
      "no-unused-vars": "warn", // Warn on unused variables
      "quotes": ["warn", "single"], // Warn single quotes
    },
    globals: {
      ...require("globals").browser // Import browser globals from the `globals` package
    }
  };
  