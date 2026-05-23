// @ts-check
import { defineConfig } from 'astro/config';

import solidJs from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
    integrations: [solidJs()],
    server: {
        proxy: {
            '/api': process.env.PUBLIC_API_URL || 'http://localhost:3001'
        }
    }
});
