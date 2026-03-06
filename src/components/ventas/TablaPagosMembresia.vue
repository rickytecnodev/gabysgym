<template>
  <div class="table-responsive">
    <table class="table table-hover">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Monto</th>
          <th>Mes Pagado</th>
          <th>Empleado</th>
          <th v-if="isSuperadmin && !filtroSucursal">Sucursal</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="pago in pagos" 
          :key="'pago-' + pago.id"
          @click="$emit('ver-detalle', pago)"
          style="cursor: pointer;"
        >
          <td>{{ formatFecha(pago.fecha_pago) }}</td>
          <td>{{ pago.membresia?.cliente?.nombre_completo || 'N/A' }}</td>
          <td class="fw-bold">${{ pago.monto.toFixed(2) }}</td>
          <td>{{ formatMesPagado(pago.mes_pagado) }}</td>
          <td>{{ pago.empleado?.nombre_completo }}</td>
          <td v-if="isSuperadmin && !filtroSucursal">
            {{ (pago.membresia?.sucursal as any)?.nombre || 'N/A' }}
          </td>
          <td @click.stop>
            <button @click="$emit('editar', pago)" class="btn btn-sm btn-outline-primary me-1" title="Editar">
              <i class="fa-solid fa-edit"></i>
            </button>
            <button 
              v-if="isSuperadmin"
              @click="$emit('eliminar', pago)" 
              class="btn btn-sm btn-outline-danger" 
              title="Eliminar"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
        <tr v-if="loading">
          <td :colspan="isSuperadmin && !filtroSucursal ? 7 : 6" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            Cargando pagos...
          </td>
        </tr>
        <tr v-else-if="pagos.length === 0">
          <td :colspan="isSuperadmin && !filtroSucursal ? 7 : 6" class="text-center text-muted">No hay pagos de membresías</td>
        </tr>
      </tbody>
    </table>
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
