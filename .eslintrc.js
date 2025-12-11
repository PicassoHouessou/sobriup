module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    /*
    parserOptions: {
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        ecmaFeatures: {
            jsx: true, // Allows for the parsing of JSX
        },
    },*/
    settings: {
        react: {
            version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
        },
    },
    extends: [
        'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        "plugin:react-hooks/recommended", //  eslint-plugin-react-hooks that enforces these hooks rules.
        //'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
        "prettier"
    ],

    rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        /*
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto',
            },
        ],
         */

        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/dot-notation': 'off',
        'react/jsx-props-no-spreading': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/display-name': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'no-console': 'error',
        'react/no-unescaped-entities': 'off'
        //"react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
        //"react-hooks/exhaustive-deps": "warn" // Checks effect dependencies

    },
};
