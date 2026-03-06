<template>
  <div class="card mb-4">
    <div class="card-body">
      <!-- Filtro rápido -->
      <div class="mb-3">
        <label class="form-label fw-bold">Filtro Rápido:</label>
        <div class="d-flex gap-2">
          <select 
            :value="periodoActivo" 
            @change="($event.target as HTMLSelectElement).value === '' ? $emit('limpiar-periodo') : $emit('aplicar-periodo', ($event.target as HTMLSelectElement).value)" 
            class="form-select"
            style="max-width: 250px;"
          >
            <option value="">Seleccionar período</option>
            <option value="hoy">Hoy</option>
            <option value="semana">Semana Actual</option>
            <option value="mes">Mes Actual</option>
            <option value="año">Año Actual</option>
            <option value="siguiente-semana">Próximos a Vencer</option>
          </select>
          <button 
            type="button" 
            class="btn btn-sm btn-outline-secondary"
            @click="$emit('limpiar-periodo')"
            v-if="periodoActivo"
          >
            Limpiar
          </button>
        </div>
      </div>
      <div class="row g-3">
        <div class="col-md-12" v-if="filtroClienteId">
          <div class="alert alert-info d-flex justify-content-between align-items-center">
            <span>
              <i class="fa-solid fa-filter me-2"></i>
              Filtrando por cliente: <strong>{{ nombreCliente }}</strong>
            </span>
            <button @click="$emit('limpiar-filtro-cliente')" class="btn btn-sm btn-outline-info">
              <i class="fa-solid fa-times me-1"></i>
              Limpiar filtro
            </button>
          </div>
        </div>
        <div v-if="isSuperadmin" class="col-md-3">
          <label class="form-label">Sucursal</label>
          <select 
            :value="filtroSucursal === null ? '' : filtroSucursal" 
            @change="$emit('update:filtroSucursal', ($event.target as HTMLSelectElement).value === '' ? null : Number(($event.target as HTMLSelectElement).value))" 
            class="form-select"
          >
            <option value="">Todas</option>
            <option v-for="sucursal in sucursales" :key="sucursal.id" :value="sucursal.id">
              {{ sucursal.nombre }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Fecha Desde</label>
          <input 
            :value="filtroFechaDesde" 
            @input="$emit('update:filtroFechaDesde', ($event.target as HTMLInputElement).value)" 
            type="date" 
            class="form-control" 
            :disabled="!!periodoActivo"
          >
        </div>
        <div class="col-md-3">
          <label class="form-label">Fecha Hasta</label>
          <input 
            :value="filtroFechaHasta" 
            @input="$emit('update:filtroFechaHasta', ($event.target as HTMLInputElement).value)" 
            type="date" 
            class="form-control" 
            :disabled="!!periodoActivo"
          >
        </div>
        <div class="col-md-3">
          <label class="form-label">Estado</label>
          <select 
            :value="filtroEstado" 
            @change="$emit('update:filtroEstado', ($event.target as HTMLSelectElement).value)" 
            class="form-select"
          >
            <option value="">Todos</option>
            <option value="activa">Activa</option>
            <option value="vencida">Vencida</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <div class="col-md-12 d-flex align-items-end gap-2">
          <button @click="$emit('actualizar-estados')" class="btn btn-info">
            <i class="fa-solid fa-sync me-1"></i>
            Actualizar Estados
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sucursal } from '@/types/gym';

defineProps<{
  periodoActivo: string;
  filtroSucursal: number | null;
  filtroFechaDesde: string;
  filtroFechaHasta: string;
  filtroEstado: string;
  filtroClienteId: number | null;
  nombreCliente: string;
  sucursales: Sucursal[];
  isSuperadmin: boolean;
}>();

defineEmits<{
  'aplicar-periodo': [periodo: string];
  'limpiar-periodo': [];
  'limpiar-filtro-cliente': [];
  'update:filtroSucursal': [value: number | null];
  'update:filtroFechaDesde': [value: string];
  'update:filtroFechaHasta': [value: string];
  'update:filtroEstado': [value: string];
  'actualizar-estados': [];
}>();
</script>
