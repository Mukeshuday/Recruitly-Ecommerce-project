// eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  // Base recommended rules
  js.configs.recommended,

  {
    files: ["/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser, // enables browser globals like window, document
      parserOptions: {
        ecmaFeatures: { jsx: true }, // enables JSX parsing
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // React-specific rules
      "react/react-in-jsx-scope": "off", // Not needed for React 17+
      "react/prop-types": "off", // Disable if not using PropTypes
      "react/jsx-uses-react": "off", // Not needed for React 17+
      "react/jsx-uses-vars": "warn",

      // React hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // JSX accessibility rules
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
    },
    settings: {
      react: {
        version: "detect", // Automatically detect the React version
      },
    },
  },
];