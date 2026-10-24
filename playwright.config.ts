import { defineConfig, devices } from '@playwright/test';

// Antes de correr: npm run build:ejemplos (compila los tres clientes de ejemplo).
const ejemplos = { _ejemplo: 4321, '_ejemplo-servicios': 4322, '_ejemplo-portfolio': 4323 };
const launchOptions = process.env.PW_CHROMIUM_PATH
  ? { executablePath: process.env.PW_CHROMIUM_PATH, args: ['--no-sandbox'] }
  : {};

export default defineConfig({
  testDir: 'tests/e2e',
  reporter: process.env.CI ? 'github' : 'list',
  use: { trace: 'retain-on-failure', launchOptions },
  projects: [
    { name: 'movil', use: { ...devices['Pixel 7'], launchOptions } },
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 }, launchOptions } },
  ],
  webServer: Object.entries(ejemplos).map(([cliente, puerto]) => ({
    command: `astro preview --port ${puerto} --ignore-lock`,
    env: { ...process.env, CLIENT: cliente } as Record<string, string>,
    url: `http://localhost:${puerto}`,
    reuseExistingServer: !process.env.CI,
  })),
});
