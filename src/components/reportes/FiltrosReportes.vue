<template>
  <div class="p-3 rounded-3 border mb-2 bg-white">
    <!-- Filtro rápido -->
    <div class="mb-3">
      <label class="form-label fw-bold">Filtro Rápido:</label>
      <div class="d-flex gap-2">
        <select :value="periodoActivo"
          @change="($event.target as HTMLSelectElement).value === '' ? $emit('limpiar-periodo') : $emit('aplicar-periodo', ($event.target as HTMLSelectElement).value)"
          class="form-select" style="max-width: 250px;">
          <option value="">Todos</option>
          <option value="hoy">Hoy</option>
          <option value="semana">Semana Actual</option>
          <option value="mes">Mes Actual</option>
          <option value="año">Año Actual</option>
        </select>
        <button type="button" class="btn btn-sm btn-outline-secondary" @click="$emit('limpiar-periodo')"
          v-if="periodoActivo">
          Limpiar
        </button>
      </div>
    </div>
    <div class="row gy-2">
      <div class="col-md-3" v-if="isSuperadmin">
        <label class="form-label">Sucursal</label>
        <select :value="filtroSucursalId === null ? '' : filtroSucursalId"
          @change="$emit('update:filtroSucursalId', ($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value))"
          class="form-select">
          <option value="">Todas</option>
          <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
            {{ sucursal.nombre }}
          </option>
        </select>
      </div>
      <div class="col-md-3" v-if="isSuperadmin">
        <label class="form-label">Empleado</label>
        <select :value="filtroEmpleadoId === null ? '' : filtroEmpleadoId"
          @change="$emit('update:filtroEmpleadoId', ($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value))"
          class="form-select">
          <option value="">Todos</option>
          <option v-for="empleado in empleadosFiltrados" :key="empleado.id" :value="empleado.id">
            {{ empleado.nombre_completo }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <label class="form-label">Fecha Desde</label>
        <input :value="filtroFechaDesde"
          @input="$emit('update:filtroFechaDesde', ($event.target as HTMLInputElement).value)" type="date"
          class="form-control" :disabled="!!periodoActivo">
      </div>
      <div class="col-md-3">
        <label class="form-label">Fecha Hasta</label>
        <input :value="filtroFechaHasta"
          @input="$emit('update:filtroFechaHasta', ($event.target as HTMLInputElement).value)" type="date"
          class="form-control" :disabled="!!periodoActivo">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sucursal, Empleado } from '@/types/gym';

defineProps<{
  periodoActivo: string;
  filtroSucursalId: number | null;
  filtroEmpleadoId: number | null;
  filtroFechaDesde: string;
  filtroFechaHasta: string;
  sucursales: Sucursal[];
  empleadosFiltrados: Empleado[];
  isSuperadmin: boolean;
}>();

defineEmits<{
  'aplicar-periodo': [periodo: string];
  'limpiar-periodo': [];
  'update:filtroSucursalId': [value: number | null];
  'update:filtroEmpleadoId': [value: number | null];
  'update:filtroFechaDesde': [value: string];
  'update:filtroFechaHasta': [value: string];
}>();
</script>
