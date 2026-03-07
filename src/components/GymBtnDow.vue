<template>
    <nav v-if="showBar" class="gym-btn-down d-md-none" aria-label="Atajos de navegación">
        <div class="gym-btn-down-inner">
            <router-link v-if="isSuperadmin" to="/gym/dashboard" class="gym-btn-down-item" active-class="active">
                <i class="fa-solid fa-home"></i>
                <span>Inicio</span>
            </router-link>
            <router-link to="/gym/ventas" class="gym-btn-down-item" active-class="active">
                <i class="fa-solid fa-cash-register"></i>
                <span>Ventas</span>
            </router-link>
            <router-link to="/gym/membresias" class="gym-btn-down-item" active-class="active">
                <i class="fa-solid fa-id-card"></i>
                <span>Membresías</span>
            </router-link>
            <router-link v-if="isSuperadmin" to="/gym/reportes" class="gym-btn-down-item" active-class="active">
                <i class="fa-solid fa-file-alt"></i>
                <span>Reportes</span>
            </router-link>
            <router-link to="/gym/bitacoras" class="gym-btn-down-item" active-class="active">
                <i class="fa-solid fa-file-pen"></i>
                <span>Bitacora</span>
            </router-link>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const route = useRoute();
const { isSuperadmin } = useAuth();

const showBar = computed(() => route.name !== 'GymLogin');
</script>

<style scoped>
.gym-btn-down {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1020;
    background-color: #224a9d;
    box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.15);
    padding-bottom: env(safe-area-inset-bottom, 0);
}

.gym-btn-down-inner {
    display: flex;
    justify-content: space-around;
    align-items: center;
    min-height: 56px;
    padding: 0.25rem 0;
}

.gym-btn-down-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.35rem 0.5rem;
    color: rgba(255, 255, 255, 0.75);
    text-decoration: none;
    font-size: 0.65rem;
    font-weight: 500;
    border-radius: 0.5rem;
    transition: color 0.2s, background-color 0.2s;
    min-width: 56px;
}

.gym-btn-down-item i {
    font-size: 1.25rem;
    margin-bottom: 0.15rem;
    display: block;
}

.gym-btn-down-item:hover {
    color: rgba(255, 255, 255, 0.95);
    background-color: rgba(255, 255, 255, 0.1);
}

.gym-btn-down-item.active {
    color: #fff;
    background-color: rgba(255, 255, 255, 0.2);
}
</style>
