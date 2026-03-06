<template>
  <div class="bg-light min-vh-100">
    <GymNavbar />
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Bitácora del Día</h1>
        <button @click="abrirModal" class="btn btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nueva Bitácora
        </button>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Fecha Desde</label>
              <input v-model="filtroFechaDesde" type="date" class="form-control">
            </div>
            <div class="col-md-6">
              <label class="form-label">Fecha Hasta</label>
              <input v-model="filtroFechaHasta" type="date" class="form-control">
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de bitácoras -->
      <div class="card">
        <div class="card-body">
          <div v-if="loadingData" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>
          <div v-else-if="bitacoras.length === 0" class="text-center text-muted py-4">
            No hay bitácoras registradas
          </div>
          <div v-else class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th v-if="isSuperadmin">Empleado</th>
                  <th v-if="isSuperadmin">Sucursal</th>
                  <th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bitacora in bitacoras" :key="bitacora.id">
                  <td>{{ formatFecha(bitacora.fecha) }}</td>
                  <td>
                    <span :class="getBadgeClass(bitacora.tipo)" class="badge">
                      {{ getTipoLabel(bitacora.tipo) }}
                    </span>
                  </td>
                  <td>{{ bitacora.descripcion }}</td>
                  <td v-if="isSuperadmin">
                    {{ bitacora.empleado?.nombre_completo || 'N/A' }}
                  </td>
                  <td v-if="isSuperadmin">
                    {{ bitacora.empleado?.sucursal?.nombre || 'N/A' }}
                  </td>
                  <td>{{ formatFecha(bitacora.fecha) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal de nueva bitácora -->
      <div v-if="showModal" class="modal show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5)">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Nueva Bitácora</h5>
              <button type="button" class="btn-close" @click="cerrarModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="guardarBitacora">
                <div class="mb-3">
                  <label class="form-label">Fecha *</label>
                  <input 
                    v-model="formBitacora.fecha" 
                    type="date" 
                    class="form-control" 
                    required
                    disabled
                    :title="'La fecha no se puede editar. Se usa la fecha actual automáticamente.'"
                  >
                  <small class="text-muted">La fecha se establece automáticamente con la fecha actual y no se puede modificar.</small>
                </div>
                <div class="mb-3">
                  <label class="form-label">Tipo *</label>
                  <select v-model="formBitacora.tipo" class="form-select" required>
                    <option value="nota">Nota</option>
                    <option value="incidente">Incidente</option>
                    <option value="observacion">Observación</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Descripción *</label>
                  <textarea 
                    v-model="formBitacora.descripcion" 
                    class="form-control" 
                    rows="4" 
                    required
                    placeholder="Describe el incidente, nota u observación..."
                  ></textarea>
                </div>
                <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useBitacoras } from '@/composables/useBitacoras';
import { getFechaActualLocal } from '@/utils/dateFormatter';
import { formatFecha } from '@/utils/dateFormatter';
import type { BitacoraDiaForm } from '@/types/gym';
import GymNavbar from '@/components/GymNavbar.vue';

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

const getTipoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    'nota': 'Nota',
    'incidente': 'Incidente',
    'observacion': 'Observación'
  };
  return labels[tipo] || tipo;
};

const getBadgeClass = (tipo: string) => {
  const classes: Record<string, string> = {
    'nota': 'bg-info',
    'incidente': 'bg-danger',
    'observacion': 'bg-warning'
  };
  return classes[tipo] || 'bg-secondary';
};

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
