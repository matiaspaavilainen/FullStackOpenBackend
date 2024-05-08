import globals from "globals";
import stylisticJs from "@stylistic/eslint-plugin-js"
import js from "@eslint/js"

export default [
  {
    ignores: ["dist"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      parserOptions: {sourceType: "commonjs"},
      globals: {...globals.browser, ...globals.node},
    },
    plugins: {
      '@stylistic/js': stylisticJs
    },
    rules: {
      '@stylistic/js/indent': ['error', 4],
      '@stylistic/js/linebreak-style': ['error', 'unix'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/semi': ['error', 'never'],
      'eqeqeq': 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', {before: true, after: true}],
      'no-console': 0,
    },
  },
];