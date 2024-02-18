module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "turbo",
    "prettier",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "eslint-plugin-tsdoc",
    "import"
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // eslint rules
    "curly": "error",
    "eqeqeq": "error",
    "no-implicit-coercion": ["error", { boolean: false }],
    "no-unused-expressions": "error",
    "no-useless-computed-key": "error",
    "no-console": "error",
    // Typescript rules
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",
    "@typescript-eslint/no-unused-vars": "error",
    '@typescript-eslint/no-unsafe-argument': 'off', // if you are experiencing false positives
    // import rules
    "import/newline-after-import": "error",
    "import/no-cycle": "error",
    "import/no-useless-path-segments": "error",
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal"],
        "newlines-between": "always"
      }
    ],
    // react rules
    'react/react-in-jsx-scope': 'off', // not needed for React 17+
    'react/prop-types': 'off', // if using TypeScript for type checking
    // react-hooks rules
    'react-hooks/rules-of-hooks': 'error', // checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // checks effect dependencies
  },
};
