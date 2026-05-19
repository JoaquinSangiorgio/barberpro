/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // agregá aquí otras VITE_* si las usás
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
