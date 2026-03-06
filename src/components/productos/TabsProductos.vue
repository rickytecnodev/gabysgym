<template>
  <div class="card">
    <div class="card-body">
      <!-- Tabs -->
      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link" 
            :class="{ active: tabActivo === 'productos' }"
            @click="$emit('cambiar-tab', 'productos')"
            type="button"
          >
            Productos
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button 
            class="nav-link" 
            :class="{ active: tabActivo === 'tipos-membresias' }"
            @click="$emit('cambiar-tab', 'tipos-membresias')"
            type="button"
          >
            Tipos de Membresías
          </button>
        </li>
      </ul>

      <!-- Tab: Productos -->
      <div v-show="tabActivo === 'productos'" class="tab-content">
        <slot name="productos" />
      </div>

      <!-- Tab: Tipos de Membresías -->
      <div v-show="tabActivo === 'tipos-membresias'" class="tab-content">
        <slot name="tipos-membresias" />
      </div>
    </div>
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
