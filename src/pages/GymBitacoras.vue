<template>
  <div class="bg-light min-vh-100">
    <div class="container-fluid py-2">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="h3 mb-0">Bitácora del Día</h1>
        <button @click="abrirModal" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nueva Bitácora
        </button>
      </div>

      <!-- Filtros -->
      <FiltrosBitacoras v-model:filtro-fecha-desde="filtroFechaDesde" v-model:filtro-fecha-hasta="filtroFechaHasta" />

      <!-- Tabla de bitácoras (Desktop) -->
      <div class="d-none d-md-block mb-2">
        <TablaBitacoras :bitacoras="bitacoras" :is-superadmin="isSuperadmin" :loading="loadingData" />
      </div>

      <!-- Vista móvil de bitácoras (Mobile) -->
      <div class="d-block d-md-none mb-2">
        <TablaBitacorasMobile :bitacoras="bitacoras" :is-superadmin="isSuperadmin" :loading="loadingData" />
      </div>

      <!-- Modal de nueva bitácora -->
      <GymModal v-model:show="showModal" title="Nueva Bitácora">
        <ModalNuevaBitacora :form="formBitacora" :error-message="errorMessage" @submit="guardarBitacora" />
        <template #footer>
          <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button type="submit" form="formBitacora" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            Guardar
          </button>
        </template>
      </GymModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useBitacoras } from '@/composables/useBitacoras';
import { getFechaActualLocal } from '@/utils/dateFormatter';
import type { BitacoraDiaForm } from '@/types/gym';
import GymModal from '@/components/GymModal.vue';
import FiltrosBitacoras from '@/components/bitacoras/FiltrosBitacoras.vue';
import TablaBitacoras from '@/components/bitacoras/TablaBitacoras.vue';
import TablaBitacorasMobile from '@/components/bitacoras/TablaBitacorasMobile.vue';
import ModalNuevaBitacora from '@/components/bitacoras/modals/NuevaBitacora.vue';

const { currentUser, isSuperadmin } = useAuth();
const {
  bitacoras,
  loading,
  loadingData,
  loadBitacoras,
  guardarBitacora: guardarBitacoraFromComposable
} = useBitacoras();

const showModal = ref(false);
const errorMessage = ref('');
const filtroFechaDesde = ref(getFechaActualLocal());
const filtroFechaHasta = ref(getFechaActualLocal());

const formBitacora = ref<BitacoraDiaForm>({
  fecha: getFechaActualLocal(),
  tipo: 'nota',
  descripcion: ''
});

const abrirModal = () => {
  // Asegurar que siempre se use la fecha actual local al abrir el modal
  formBitacora.value = {
    fecha: getFechaActualLocal(),
    tipo: 'nota',
    descripcion: ''
  };
  errorMessage.value = '';
  showModal.value = true;
};

const cerrarModal = () => {
  showModal.value = false;
  // Asegurar que siempre se use la fecha actual local
  formBitacora.value = {
    fecha: getFechaActualLocal(),
    tipo: 'nota',
    descripcion: ''
  };
  errorMessage.value = '';
};

const cargarBitacoras = () => {
  const empleadoId = isSuperadmin.value ? null : currentUser.value?.id;
  loadBitacoras(
    empleadoId,
    filtroFechaDesde.value || null,
    filtroFechaHasta.value || null
  );
};

const guardarBitacora = async () => {
  if (!currentUser.value) {
    errorMessage.value = 'Usuario no autenticado';
    return;
  }

  if (!formBitacora.value.descripcion.trim()) {
    errorMessage.value = 'La descripción es requerida';
    return;
  }

  errorMessage.value = '';

  // Asegurar que se use la fecha actual local si no se especificó otra
  const payload = {
    ...formBitacora.value,
    fecha: formBitacora.value.fecha || getFechaActualLocal()
  };

  const result = await guardarBitacoraFromComposable(
    currentUser.value.id,
    payload
  );

  if (result.success) {
    cerrarModal();
    cargarBitacoras();
  }
};

// Watcher para hacer los filtros reactivos
watch([filtroFechaDesde, filtroFechaHasta], () => {
  cargarBitacoras();
});

onMounted(() => {
  cargarBitacoras();
});
</script>
