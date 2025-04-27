import { resolve } from "node:path";
import stylistic from "@stylistic/eslint-plugin";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import { includeIgnoreFile } from "@eslint/compat";

export default defineConfigWithVueTs([
  vueTsConfigs.recommendedTypeChecked,
  includeIgnoreFile(resolve(".gitignore")),
  {
    files: ["**/*.js", "**/*.mjs", "**/*.ts", "**/*.vue"],
    plugins: {
      "@stylistic": stylistic,
      "@typescript-eslint": tsPlugin,
      "import": importPlugin,
      "vue": pluginVue
    },
    rules: {
      ...pluginVue.configs.base.rules,
      ...pluginVue.configs["flat/recommended"].map(c => c.rules).reduce((acc, c) => ({ ...acc, ...c }), {}),
      ...pluginVue.configs["flat/strongly-recommended"].map(c => c.rules).reduce((acc, c) => ({ ...acc, ...c }), {}),
      ...pluginVue.configs["flat/essential"].map(c => c.rules).reduce((acc, c) => ({ ...acc, ...c }), {}),
      "no-console": ["error", { allow: ["info", "warn"] }],
      "@stylistic/indent": ["error", 2, { SwitchCase: 1 }],
      "@stylistic/linebreak-style": ["error", process.platform === "win32" ? "windows" : "unix"],
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/no-extra-semi": "error",
      "@stylistic/comma-dangle": ["error", "never"],
      "@stylistic/space-before-function-paren": ["error", "always"],
      "@stylistic/multiline-ternary": ["error", "never"],
      "@stylistic/member-delimiter-style": ["error", { multiline: { delimiter: "semi" }, singleline: { delimiter: "comma" } }],
      "@stylistic/arrow-spacing": ["error", { before: true, after: true }],
      "@stylistic/brace-style": ["error", "stroustrup", { allowSingleLine: true }],
      "@stylistic/no-multi-spaces": "error",
      "@stylistic/space-before-blocks": "error",
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/block-spacing": ["error", "always"],
      "@stylistic/comma-spacing": ["error", { after: true, before: false }],
      "@stylistic/comma-style": ["error", "last"],
      "@stylistic/key-spacing": ["error", { afterColon: true, beforeColon: false }],
      "@stylistic/keyword-spacing": ["error", { after: true, before: true }],
      "@stylistic/object-curly-newline": "off",
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/object-property-newline": ["error", { allowMultiplePropertiesPerLine: true }],
      "@stylistic/one-component-per-file": "off",
      "@stylistic/require-default-prop": "off",
      "@stylistic/space-in-parens": ["error", "never"],
      "@stylistic/template-curly-spacing": "error",
      "@stylistic/quote-props": ["error", "consistent-as-needed"],
      "sort-imports": ["error", { ignoreDeclarationSort: true }],
      "import/first": "error",
      "import/no-duplicates": "error",
      "import/no-mutable-exports": "error",
      "import/no-named-default": "error",
      "import/no-self-import": "error",
      "import/order": "error",
      "import/newline-after-import": ["error", { count: 1 }],
      "@typescript-eslint/consistent-type-imports": "error",
      "vue/first-attribute-linebreak": ["error", { singleline: "ignore", multiline: "ignore" }],
      "vue/max-attributes-per-line": ["error", { singleline: 100 }],
      "vue/singleline-html-element-content-newline": ["off"],
      "vue/no-multiple-template-root": ["off"],
      "vue/html-closing-bracket-spacing": ["error", { selfClosingTag: "always" }],
      "vue/html-indent": ["error", 2],
      "vue/multiline-html-element-content-newline": ["error", { ignores: [] }]
    }
  }
]);