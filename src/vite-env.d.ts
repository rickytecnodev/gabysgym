/// <reference types="vite/client" />

import type Swal from "sweetalert2";

declare module "vue" {
  interface ComponentCustomProperties {
    $swal: typeof Swal;
  }
}

interface ImportMetaEnv {
  readonly BASE_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
