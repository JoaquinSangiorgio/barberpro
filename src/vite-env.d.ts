/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // agregá aquí otras VITE_* si las usás
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
