/** @type {import("prettier").Options} */
export default {
    arrowParens: 'always',
    bracketSameLine: false,
    bracketSpacing: true,
    embeddedLanguageFormatting: 'auto',
    endOfLine: 'lf',
    htmlWhitespaceSensitivity: 'css',
    insertPragma: false,
    jsxSingleQuote: false,
    printWidth: 80,
    proseWrap: 'always',
    quoteProps: 'as-needed',
    requirePragma: false,
    semi: false,
    singleAttributePerLine: false,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    useTabs: true,
    overrides: [
        {
            files: [ '**/*.json' ],
            options: {
                useTabs: true,
                tabWidth: 4,
            },
        },
    ],
    plugins: [ 'prettier-plugin-tailwindcss' ],
}
