import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";


export default [
    {
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
                sourceType: 'module', // Allows for the use of imports
                ecmaFeatures: {
                    jsx: true, // Allows for the parsing of JSX
                },
            },
        }
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReactConfig,
    {
        rules: {
            // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
            // e.g. "@typescript-eslint/explicit-function-return-type": "off",
            'linebreak-style': 'off',
            'prettier/prettier': [
                'error',
                {
                    endOfLine: 'auto',
                },
            ],
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/dot-notation': 'off',
            'import/prefer-default-export': 'off',
            'react/jsx-props-no-spreading': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/display-name': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'no-console': 'error',

        },
    }
];