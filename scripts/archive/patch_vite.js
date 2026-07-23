import fs from 'fs';
let content = fs.readFileSync('vite.config.ts', 'utf8');

content = content.replace("import {defineConfig} from 'vite';", "import {defineConfig} from 'vite';\nimport { VitePWA } from 'vite-plugin-pwa';");

const newPlugins = `plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\\/\\/raw\\.githubusercontent\\.com\\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'audio-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        manifest: {
          name: 'FocusFlow',
          short_name: 'FocusFlow',
          description: 'Focus timer and task manager',
          theme_color: '#000000',
          display: 'standalone',
          icons: []
        }
      })
    ],`;
content = content.replace("plugins: [react(), tailwindcss()],", newPlugins);
fs.writeFileSync('vite.config.ts', content);
