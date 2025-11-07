module.exports = [
  // global ignores
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', '.vite/**', '.cache/**']
  },
  // rules for TypeScript and JS files
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks')
    },
    settings: {
      react: { version: 'detect' }
    },
    rules: {
      // basic adjustments for a React + TypeScript project
      'react/react-in-jsx-scope': 'off'
    }
  }
];
