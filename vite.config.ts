import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// FIX: Import 'cwd' from 'node:process' to resolve TypeScript error where 'process.cwd' was not found.
import { cwd } from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '');

  const processEnv = {};
  for (const key in env) {
    // FIX: Expose API_KEY for the Gemini service, in addition to VITE_ prefixed variables.
    if (key.startsWith('VITE_') || key === 'API_KEY') {
      processEnv[`process.env.${key}`] = JSON.stringify(env[key]);
    }
  }

  return {
    plugins: [react()],
    // Bu tanım, Vite'in sadece `VITE_` ile başlayan
    // ortam değişkenlerini güvenli bir şekilde koda dahil etmesini sağlar.
    define: processEnv,
  };
});