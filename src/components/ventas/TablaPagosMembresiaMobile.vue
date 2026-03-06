<template>
  <div>
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-else-if="pagos.length === 0" class="text-center text-muted py-4">
      No hay pagos de membresías
    </div>
    <div v-else class="row g-3">
      <div v-for="pago in pagos" :key="'pago-' + pago.id" class="col-12">
        <div 
          class="card h-100 shadow-sm" 
          @click="$emit('ver-detalle', pago)"
          style="cursor: pointer;"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="flex-grow-1">
                <h6 class="card-title mb-1 fw-bold">
                  {{ pago.membresia?.cliente?.nombre_completo || 'N/A' }}
                </h6>
                <div class="small text-muted">
                  <i class="fa-solid fa-calendar me-1"></i>
                  {{ formatFecha(pago.fecha_pago) }}
                </div>
              </div>
              <div class="fw-bold fs-5 text-success">
                ${{ pago.monto.toFixed(2) }}
              </div>
            </div>
            <div class="mb-2">
              <div class="small text-muted mb-1">
                <i class="fa-solid fa-calendar-check me-1"></i>
                Mes pagado: {{ formatMesPagado(pago.mes_pagado) }}
              </div>
              <div class="small text-muted">
                <i class="fa-solid fa-user me-1"></i>
                {{ pago.empleado?.nombre_completo }}
              </div>
              <div v-if="isSuperadmin && !filtroSucursal && pago.membresia?.sucursal" class="small text-muted mt-1">
                <i class="fa-solid fa-building me-1"></i>
                {{ (pago.membresia.sucursal as any)?.nombre }}
              </div>
            </div>
            <div class="d-flex gap-1 mt-2 pt-2 border-top" @click.stop>
              <button @click.stop="$emit('editar', pago)" class="btn btn-sm btn-outline-primary" title="Editar">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button 
                v-if="isSuperadmin"
                @click.stop="$emit('eliminar', pago)" 
                class="btn btn-sm btn-outline-danger" 
                title="Eliminar"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PagoMembresia } from '@/types/gym';
import { formatFecha, formatMesPagado } from '@/utils/dateFormatter';

defineProps<{
  pagos: PagoMembresia[];
  isSuperadmin: boolean;
  filtroSucursal: number | null;
  loading?: boolean;
}>();

defineEmits<{
  'ver-detalle': [pago: PagoMembresia];
  'editar': [pago: PagoMembresia];
  'eliminar': [pago: PagoMembresia];
}>();
</script>

<style scoped>
.card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
