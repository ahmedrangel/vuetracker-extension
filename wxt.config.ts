import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import pkg from "./package.json" with { type: "json" };

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue", "@wxt-dev/auto-icons"],
  srcDir: "src",
  manifest: {
    name: pkg.title,
    description: pkg.description,
    version: pkg.version,
    permissions: ["activeTab", "scripting", "storage", "webRequest"],
    host_permissions: ["<all_urls>"],
    action: {},
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'"
    },
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: ["content-scripts/content.js"],
        run_at: "document_start"
      }
    ],
    web_accessible_resources: [
      {
        resources: ["/content-scripts/injected.js"],
        matches: ["<all_urls>"]
      }
    ]
  },
  webExt: {
    startUrls: ["https://wxt.dev/"]
  },
  autoIcons: {
    developmentIndicator: false
  },
  vite: () => ({
    plugins: [
      tailwindcss()
    ]
  })
});
