<template>
  <nav class="navbar navbar-expand-lg navbar-dark shadow fixed-top" style="background-color: #224a9d;">
    <div class="container-fluid">
      <router-link class="navbar-brand fw-bold" to="/gym/dashboard">
        <i class="fa-solid fa-dumbbell me-2"></i>
        Sistema de Gimnasios
      </router-link>
      <button 
        class="navbar-toggler border-0" 
        type="button" 
        @click="toggleMenu"
        aria-label="Abrir menú"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" :class="{ show: menuOpen }">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item" v-if="isSuperadmin">
            <router-link 
              to="/gym/dashboard" 
              class="nav-link px-3" 
              active-class="active"
              @click="closeMenu"
            >
              <i class="fa-solid fa-home me-2"></i>
              Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/gym/productos" 
              class="nav-link px-3" 
              active-class="active"
              @click="closeMenu"
            >
              <i class="fa-solid fa-box me-2"></i>
              Productos
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/gym/ventas" 
              class="nav-link px-3" 
              active-class="active"
              @click="closeMenu"
            >
              <i class="fa-solid fa-cash-register me-2"></i>
              Ventas
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/gym/membresias" 
              class="nav-link px-3" 
              active-class="active"
              @click="closeMenu"
            >
              <i class="fa-solid fa-id-card me-2"></i>
              Membresías
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/gym/clientes" 
              class="nav-link px-3" 
              active-class="active"
              @click="closeMenu"
            >
              <i class="fa-solid fa-users me-2"></i>
              Clientes
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/gym/reportes" 
              class="nav-link px-3" 
              active-class="active"
              @click="closeMenu"
            >
              <i class="fa-solid fa-chart-bar me-2"></i>
              Reportes
            </router-link>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle d-flex align-items-center px-3" 
              href="#" 
              @click.prevent="toggleDropdown"
              role="button"
            >
              <i class="fa-solid fa-user-circle me-2"></i>
              <span>{{ currentUser?.nombre_completo || 'Usuario' }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" :class="{ show: dropdownOpen }">
              <li>
                <div class="dropdown-item-text">
                  <small class="text-muted d-block">
                    <i class="fa-solid fa-building me-2"></i>
                    {{ currentSucursal?.nombre || 'Todas las sucursales' }}
                  </small>
                </div>
              </li>
              <li v-if="isSuperadmin">
                <div class="dropdown-item-text">
                  <small class="text-muted d-block">
                    <i class="fa-solid fa-shield-halved me-2"></i>
                    Super Administrador
                  </small>
                </div>
              </li>
              <li><hr class="dropdown-divider my-2"></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                  <i class="fa-solid fa-sign-out-alt me-2"></i>
                  Cerrar Sesión
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { fetchSucursales } from '@/services/gymApi';
import type { Sucursal } from '@/types/gym';

const router = useRouter();
const { currentUser, currentSucursalId, clearSession, isSuperadmin } = useAuth();

const menuOpen = ref(false);
const dropdownOpen = ref(false);
const currentSucursal = ref<Sucursal | null>(null);

onMounted(async () => {
  if (currentSucursalId.value) {
    const { data } = await fetchSucursales();
    if (data) {
      currentSucursal.value = data.find(s => s.id === currentSucursalId.value) || null;
    }
  }
});

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
  dropdownOpen.value = false;
};

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

const handleLogout = () => {
  closeMenu();
  clearSession();
  router.push('/gym/login');
};
</script>

<style scoped>
.navbar-brand {
  font-size: 1.25rem;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1050;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85) !important;
  transition: all 0.2s ease;
  border-radius: 0.375rem;
  margin: 0 0.25rem;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 1) !important;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  color: #fff !important;
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 500;
}

.dropdown-toggle::after {
  margin-left: 0.5rem;
}

.dropdown-menu {
  min-width: 220px;
  border-radius: 0.5rem;
}

.dropdown-item {
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item-text {
  padding: 0.5rem 1rem;
}

@media (max-width: 991.98px) {
  .navbar-collapse {
    background-color: rgba(34, 74, 157, 0.98);
    border-radius: 0.5rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
  }
  
  .nav-link {
    margin: 0.25rem 0;
  }
}
</style>

