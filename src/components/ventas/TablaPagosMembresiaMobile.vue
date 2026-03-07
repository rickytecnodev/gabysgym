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
    <div v-else class="gy-2">
      <div v-for="pago in pagos" :key="'pago-' + pago.id" @click="$emit('ver-detalle', pago)">
        <div class="p-3 rounded-3 border bg-white mb-2 borde-izq-tarjeta borde-izq-verde" style="cursor: pointer;">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <h6 class="card-title mb-1 fw-bold">{{ pago.membresia?.cliente?.nombre_completo || 'N/A' }}</h6>
              <span class="small text-muted">
                <i class="fa-solid fa-calendar me-1"></i>
                {{ formatFecha(pago.fecha_pago) }}
              </span>
            </div>
            <div class="d-flex">
              <div class="fw-bold text-success">${{ pago.monto.toFixed(2) }}</div>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <div class="small text-muted">Mes pagado</div>
              <div class="fw-bold">{{ formatMesPagado(pago.mes_pagado) }}</div>
            </div>
            <div class="text-end">
              <div class="small text-muted">Empleado</div>
              <div class="fw-bold">{{ pago.empleado?.nombre_completo || '—' }}</div>
            </div>
          </div>
          <div class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center" @click.stop>
            <div class="d-flex gap-1">
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
            <span v-if="isSuperadmin && !filtroSucursal && pago.membresia?.sucursal" class="small text-muted">
              <i class="fa-solid fa-building me-1"></i>
              {{ (pago.membresia.sucursal as any)?.nombre }}
            </span>
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
.borde-izq-tarjeta {
  border-left-width: 5px !important;
  border-left-style: solid !important;
  transition: transform 0.2s, box-shadow 0.2s;
}

.borde-izq-verde { border-left-color: var(--bs-success) !important; }

.borde-izq-tarjeta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
