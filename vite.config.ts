import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Bu tanım, Vite'in process.env değişkenlerini
  // import.meta.env gibi tanımasını ve koda dahil etmesini sağlar.
  // Bu, Render.com gibi platformlarda ortam değişkenlerini
  // kullanmak için kararlı bir yöntemdir.
  define: {
    'process.env': process.env
  }
});
