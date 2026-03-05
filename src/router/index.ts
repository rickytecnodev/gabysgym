import { createRouter, createWebHashHistory } from 'vue-router';
import GymLogin from '@/pages/GymLogin.vue';
import GymDashboard from '@/pages/GymDashboard.vue';
import GymProductos from '@/pages/GymProductos.vue';
import GymVentas from '@/pages/GymVentas.vue';
import GymMembresias from '@/pages/GymMembresias.vue';
import GymClientes from '@/pages/GymClientes.vue';
import GymReportes from '@/pages/GymReportes.vue';
import { useAuth } from '@/composables/useAuth';

const routes = [
  {
    path: '/',
    redirect: '/gym/login'
  },
  {
    path: '/gym/login',
    name: 'GymLogin',
    component: GymLogin,
    meta: { requiresGuest: true }
  },
  {
    path: '/gym/dashboard',
    name: 'GymDashboard',
    component: GymDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/gym/productos',
    name: 'GymProductos',
    component: GymProductos,
    meta: { requiresAuth: true }
  },
  {
    path: '/gym/ventas',
    name: 'GymVentas',
    component: GymVentas,
    meta: { requiresAuth: true }
  },
  {
    path: '/gym/membresias',
    name: 'GymMembresias',
    component: GymMembresias,
    meta: { requiresAuth: true }
  },
  {
    path: '/gym/clientes',
    name: 'GymClientes',
    component: GymClientes,
    meta: { requiresAuth: true }
  },
  {
    path: '/gym/reportes',
    name: 'GymReportes',
    component: GymReportes,
    meta: { requiresAuth: true }
  },
  {
    path: '/gym',
    redirect: '/gym/login'
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// Guard de navegación para proteger rutas
router.beforeEach((to, _from, next) => {
  const { isAuthenticated } = useAuth();

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ name: 'GymLogin' });
    return;
  }

  // Si la ruta requiere ser invitado (no autenticado) y el usuario está autenticado
  if (to.meta.requiresGuest && isAuthenticated.value) {
    next({ name: 'GymDashboard' });
    return;
  }

  next();
});

export default router;
