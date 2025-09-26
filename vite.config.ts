import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";
import type { ServerOptions as HttpsServerOptions } from "https";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), "");
  const env = { ...process.env, ...fileEnv } as Record<string, string | undefined>;

  const enableHttps = env.VITE_HTTPS === "1" || env.VITE_HTTPS === "true" || env.HTTPS === "true";
  let httpsOption: HttpsServerOptions | undefined = undefined;

  if (enableHttps) {
    const keyPath = env.VITE_HTTPS_KEY || path.resolve(process.cwd(), "certs/dev.key");
    const certPath = env.VITE_HTTPS_CERT || path.resolve(process.cwd(), "certs/dev.crt");
    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      httpsOption = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
        minVersion: "TLSv1.2",
        honorCipherOrder: true,
      };
    } else {
      console.warn("HTTPS requested but certs not found. Set VITE_HTTPS_KEY and VITE_HTTPS_CERT or place files in certs/dev.key and certs/dev.crt. Falling back to HTTP.");
    }
  }

  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
      https: httpsOption,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});