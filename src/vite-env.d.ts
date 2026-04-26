/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_APP_MODE?: 'local' | 'api';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
