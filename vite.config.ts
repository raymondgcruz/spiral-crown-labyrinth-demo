import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const publicHardening = process.env.ROANOKE_PUBLIC_HARDENING === 'true';

  return {
    base: "/spiral-crown-labyrinth-demo/",
    plugins: [react(), tailwindcss()],
    define: {
      // Never embed private keys into the hardened browser artifact.
      // Local/dev work may still read GEMINI_API_KEY when hardening is off.
      'process.env.GEMINI_API_KEY': JSON.stringify(publicHardening ? '' : env.GEMINI_API_KEY),
      '__ROANOKE_PUBLIC_HARDENING__': JSON.stringify(publicHardening),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    esbuild: {
      drop: publicHardening ? ['console', 'debugger'] : [],
      legalComments: publicHardening ? 'none' : 'eof',
    },
    build: {
      sourcemap: false,
      minify: 'esbuild',
      cssMinify: true,
      reportCompressedSize: !publicHardening,
      rollupOptions: {
        output: {
          manualChunks: publicHardening
            ? undefined
            : {
                vendor: ['react', 'react-dom', 'motion', 'lucide-react', '@google/genai'],
              },
          entryFileNames: publicHardening ? 'assets/e/[hash].js' : 'assets/[name]-[hash].js',
          chunkFileNames: publicHardening ? 'assets/c/[hash].js' : 'assets/[name]-[hash].js',
          assetFileNames: publicHardening ? 'assets/a/[hash][extname]' : 'assets/[name]-[hash][extname]',
          compact: publicHardening,
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
