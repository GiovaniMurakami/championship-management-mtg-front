import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const S3_HOST = /(^|\.)s3([.-][a-z0-9-]+)?\.amazonaws\.com$/i;

function s3ImageDevProxy() {
  return {
    name: "s3-image-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/__s3-image", async (req, res) => {
        try {
          const target = new URL(req.url || "", "http://localhost").searchParams.get("url");
          if (!target) {
            res.statusCode = 400;
            res.end("url ausente");
            return;
          }
          const parsed = new URL(target);
          if ((parsed.protocol !== "https:" && parsed.protocol !== "http:") || !S3_HOST.test(parsed.hostname)) {
            res.statusCode = 400;
            res.end("url invalida");
            return;
          }
          const upstream = await fetch(parsed.href);
          res.statusCode = upstream.status;
          const contentType = upstream.headers.get("content-type") || "application/octet-stream";
          res.setHeader("Content-Type", contentType);
          res.setHeader("Cache-Control", "private, max-age=120");
          const bytes = Buffer.from(await upstream.arrayBuffer());
          res.end(bytes);
        } catch {
          res.statusCode = 502;
          res.end("falha ao buscar imagem");
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), s3ImageDevProxy()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setupTests.js",
  },
  build: {
    chunkSizeWarningLimit: 450,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/ably")) return "ably";
          if (id.includes("node_modules/mp4-muxer")) return "story-export";
        },
      },
    },
  },
})
