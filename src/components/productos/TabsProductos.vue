<template>
  <!-- Selector tipo pill: Bootstrap primary / outline -->
  <div class="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Tipo de contenido">
    <button type="button"
      :class="['btn btn-sm rounded-pill px-4 py-2', tabActivo === 'productos' ? 'btn-primary' : 'btn-outline-secondary']"
      @click="$emit('cambiar-tab', 'productos')">
      <i class="fa-solid fa-box me-1"></i>
      Productos
    </button>
    <button type="button"
      :class="['btn btn-sm rounded-pill px-4 py-2', tabActivo === 'tipos-membresias' ? 'btn-primary' : 'btn-outline-secondary']"
      @click="$emit('cambiar-tab', 'tipos-membresias')">
      <i class="fa-solid fa-id-card me-1"></i>
      Membresías
    </button>
  </div>

  <!-- Contenido: Productos -->
  <div v-show="tabActivo === 'productos'" class="tab-content">
    <slot name="productos" />
  </div>

  <!-- Contenido: Tipos de Membresías -->
  <div v-show="tabActivo === 'tipos-membresias'" class="tab-content">
    <slot name="tipos-membresias" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  tabActivo: 'productos' | 'tipos-membresias';
}>();

defineEmits<{
  'cambiar-tab': [tab: 'productos' | 'tipos-membresias'];
}>();
</script>
