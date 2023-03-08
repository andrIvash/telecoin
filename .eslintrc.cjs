module.exports = {
    parser: "@babel/eslint-parser",
    parserOptions: {
        requireConfigFile: false,
    },
    extends: [
        "handlebarlabs",
        "prettier"
    ],
    rules: {
        "react/jsx-props-no-spreading": 0,
        "react/jsx-curly-newline": 0,
        "react/style-prop-object": 0,
        "indent": ["error", 4]
    },
}