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
            :class="{ active: tabActivo === 'membresias' }"
            @click="$emit('cambiar-tab', 'membresias')"
            type="button"
          >
            Membresías
          </button>
        </li>
      </ul>

      <!-- Tab: Productos -->
      <div v-show="tabActivo === 'productos'" class="tab-content">
        <slot name="productos" />
      </div>

      <!-- Tab: Membresías -->
      <div v-show="tabActivo === 'membresias'" class="tab-content">
        <slot name="membresias" />
      </div>
    </div>
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
