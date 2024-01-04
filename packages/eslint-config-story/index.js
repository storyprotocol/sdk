module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
      "eslint:recommended",
      "turbo",
      "prettier",
      "plugin:import/typescript",
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
    ],
    plugins: ["@typescript-eslint", "eslint-plugin-tsdoc", "import"],
    rules: {
        // eslint
        "curly": "error",
        "eqeqeq": "error",
        "no-implicit-coercion": ["error", { boolean: false }],
        "no-unused-expressions": "error",
        "no-useless-computed-key": "error",
        "no-console": "error",

        // Typescript 
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": "error",
        "@typescript-eslint/no-unused-vars": "error",
        '@typescript-eslint/no-unsafe-argument': 'off', // causing a lot of IDE false positives.

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
        ]
    }
}