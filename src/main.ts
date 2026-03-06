import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Swal from "sweetalert2";
import "@/style.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});

app.config.globalProperties.$swal = Swal;

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  // @ts-ignore - virtual:pwa-register es un módulo virtual de vite-plugin-pwa
  import('virtual:pwa-register').then(({ registerSW }) => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        // Mostrar notificación cuando hay una actualización disponible
        Swal.fire({
          title: 'Actualización disponible',
          text: 'Hay una nueva versión disponible. ¿Deseas actualizar?',
          icon: 'info',
          showCancelButton: true,
          confirmButtonText: 'Actualizar',
          cancelButtonText: 'Más tarde'
        }).then((result) => {
          if (result.isConfirmed) {
            updateSW(true);
          }
        });
      },
      onOfflineReady() {
        console.log('App ready to work offline');
      },
    });
  }).catch(() => {
    // El módulo virtual solo está disponible cuando el plugin está activo
    console.log('PWA register not available');
  });
}

app.mount("#gymapp");
