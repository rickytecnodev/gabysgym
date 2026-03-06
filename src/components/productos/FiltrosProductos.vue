<template>
  <div class="card mb-4">
    <div class="card-body">
      <div class="row g-3">
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
          <label class="form-label">Categoría</label>
          <select 
            :value="filtroCategoria" 
            @change="$emit('update:filtroCategoria', ($event.target as HTMLSelectElement).value)" 
            class="form-select"
          >
            <option value="">Todas</option>
            <option value="suplementos">Suplementos</option>
            <option value="ropa">Ropa</option>
            <option value="accesorios">Accesorios</option>
            <option value="bebidas">Bebidas</option>
            <option value="otros">Otros</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Estado</label>
          <select 
            :value="filtroEstado" 
            @change="$emit('update:filtroEstado', ($event.target as HTMLSelectElement).value)" 
            class="form-select"
          >
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sucursal } from '@/types/gym';

defineProps<{
  filtroSucursal: number | null;
  filtroCategoria: string;
  filtroEstado: string;
  sucursales: Sucursal[];
  isSuperadmin: boolean;
}>();

defineEmits<{
  'update:filtroSucursal': [value: number | null];
  'update:filtroCategoria': [value: string];
  'update:filtroEstado': [value: string];
}>();
</script>
