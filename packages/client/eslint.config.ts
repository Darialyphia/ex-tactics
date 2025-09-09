import pluginVue from 'eslint-plugin-vue';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import fs from 'fs-extra';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';

const unpluginAutoImport = fs.readJSONSync('./.eslintrc-auto-import.json');
export default defineConfigWithVueTs([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}']
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**']
  },

  { name: 'unplugin-auto-import', languageOptions: unpluginAutoImport },

  {
    name: 'unplugin-vue-router',
    languageOptions: {
      globals: {
        definePage: 'readonly'
      }
    },
    settings: {
      'import/core-modules': ['vue-router/auto-routes']
    }
  },

  ...pluginVue.configs['flat/essential'],
  {
    name: 'app/rules-overrides',
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  },

  skipFormatting,
  vueTsConfigs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
]);
