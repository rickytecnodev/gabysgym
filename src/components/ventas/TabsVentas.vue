<template>
  <div class="d-flex flex-wrap gap-2 mb-3 px-1 py-1" role="group" aria-label="Tipo de ventas">
    <button type="button"
      :class="['btn btn-sm rounded-pill px-4 py-2', tabActivo === 'productos' ? 'btn-primary' : 'btn-outline-secondary']"
      @click="$emit('cambiar-tab', 'productos')">
      <i class="fa-solid fa-box me-1"></i>
      Productos
    </button>
    <button type="button"
      :class="['btn btn-sm rounded-pill px-4 py-2', tabActivo === 'membresias' ? 'btn-primary' : 'btn-outline-secondary']"
      @click="$emit('cambiar-tab', 'membresias')">
      <i class="fa-solid fa-id-card me-1"></i>
      Membresías
    </button>
  </div>

  <!-- Contenido: Productos -->
  <div v-show="tabActivo === 'productos'" class="tab-content">
    <slot name="productos" />
  </div>

  <!-- Contenido: Membresías -->
  <div v-show="tabActivo === 'membresias'" class="tab-content">
    <slot name="membresias" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabActivo: 'productos' | 'membresias';
}>();

defineEmits<{
  'cambiar-tab': [tab: 'productos' | 'membresias'];
}>();
</script>
