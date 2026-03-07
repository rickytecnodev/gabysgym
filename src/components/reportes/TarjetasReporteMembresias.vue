<template>
  <div class="p-3 rounded-3 border bg-white">
    <h5 class="mb-3">Estado de Membresías</h5>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      Cargando reportes...
    </div>
    <div v-else-if="reporteMembresias" class="row g-3">
      <div class="col-6 col-md-3">
        <div class="p-3 rounded-3 border shadow-sm h-100 d-flex flex-column justify-content-center text-center">
          <h3 class="text-success mb-0">{{ reporteMembresias.total_activas }}</h3>
          <p class="mb-0 text-muted small">Membresías Activas</p>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="p-3 rounded-3 border shadow-sm h-100 d-flex flex-column justify-content-center text-center">
          <h3 class="text-danger mb-0">{{ reporteMembresias.total_vencidas }}</h3>
          <p class="mb-0 text-muted small">Membresías Vencidas</p>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="p-3 rounded-3 border shadow-sm h-100 d-flex flex-column justify-content-center text-center">
          <h3 class="text-secondary mb-0">{{ reporteMembresias.total_canceladas }}</h3>
          <p class="mb-0 text-muted small">Membresías Canceladas</p>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="p-3 rounded-3 border shadow-sm h-100 d-flex flex-column justify-content-center text-center">
          <h3 class="text-warning mb-0">{{ reporteMembresias.por_vencer_7_dias }}</h3>
          <p class="mb-0 text-muted small">Por Vencer (7 días)</p>
        </div>
      </div>
    </div>
    <p v-else class="text-muted mb-0">Cargando datos...</p>
  </div>
</template>

<script setup lang="ts">
interface ReporteMembresias {
  total_activas: number;
  total_vencidas: number;
  total_canceladas: number;
  por_vencer_7_dias: number;
}

defineProps<{
  reporteMembresias: ReporteMembresias | null;
  loading?: boolean;
}>();
</script>
