# Sistema de Gestión para Cadena de Gimnasios

Sistema completo de gestión para una cadena pequeña de gimnasios con múltiples sucursales, desarrollado con Vue 3, TypeScript y Supabase.

## 🚀 Características

- **Autenticación por sucursal**: Cada empleado se autentica en su sucursal correspondiente
- **Roles de usuario**: Superadmin (acceso global) y Empleado (acceso limitado a su sucursal)
- **Gestión de productos**: Control de inventario con stock, precios y categorías
- **Gestión de ventas**: Registro de ventas con control de pagos pendientes
- **Gestión de membresías**: Control completo de membresías con estados (activa, vencida, cancelada)
- **Recordatorios por WhatsApp**: Envío de recordatorios automáticos para membresías próximas a vencer
- **Reportes**: Reportes de ventas y estado de membresías con filtros avanzados

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Supabase
- Variables de entorno configuradas

## 🔧 Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
Crea un archivo `.env` en la raíz del proyecto con:
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_KEY=tu_clave_anon_de_supabase
```

3. **Ejecutar el schema SQL en Supabase**:
   - Abre el archivo `supabase-gym-schema.sql`
   - Ejecuta todo el contenido en el SQL Editor de Supabase
   - Esto creará todas las tablas necesarias y datos dummy para pruebas

## 🗄️ Estructura de Base de Datos

El schema incluye las siguientes tablas:
- `sucursales`: Información de las sucursales
- `empleados`: Usuarios del sistema (superadmin y empleados)
- `clientes`: Datos de los clientes
- `productos`: Inventario de productos
- `ventas`: Registro de ventas
- `venta_detalles`: Detalle de productos vendidos
- `tipos_membresia`: Tipos de membresías disponibles
- `membresias`: Membresías de clientes
- `pagos_membresia`: Historial de pagos de membresías

## 👤 Credenciales de Prueba

### Superadmin
- **Usuario**: `superadmin`
- **Contraseña**: `admin123`
- **Acceso**: Todas las sucursales

### Empleados
- **Usuario**: `empleado1` / `empleado2` / `empleado3`
- **Contraseña**: `empleado123`
- **Sucursales**: Gym Central, Gym Norte, Gym Sur (respectivamente)

## 🎯 Uso del Sistema

### Acceso al Sistema

1. Navega a `/gym/login` en tu aplicación
2. Ingresa tus credenciales
3. Si eres empleado, selecciona tu sucursal
4. Si eres superadmin, puedes acceder sin seleccionar sucursal

### Dashboard

El dashboard muestra:
- Ventas del día
- Membresías activas
- Membresías por vencer (7 días)
- Ventas pendientes de pago

### Gestión de Productos

- Ver todos los productos de tu sucursal
- Crear nuevos productos
- Editar productos existentes
- Eliminar productos
- Filtrar por categoría y estado

### Gestión de Ventas

- Registrar nuevas ventas
- Agregar múltiples productos a una venta
- Marcar ventas como pagadas
- Ver detalles de ventas
- Filtrar por fecha y estado de pago

### Gestión de Membresías

- Crear nuevas membresías
- Ver todas las membresías con filtros por estado
- Enviar recordatorios por WhatsApp
- Cancelar membresías (cambia estado, no elimina)
- Ver historial de pagos
- Actualizar estados automáticamente (vencidas)

### Reportes

- **Reporte de Ventas**: 
  - Por fecha (desde/hasta)
  - Por empleado (solo superadmin)
  - Total de ventas y monto
  
- **Reporte de Membresías**:
  - Total de membresías activas
  - Total de membresías vencidas
  - Total de membresías canceladas
  - Membresías por vencer en 7 días

## 📱 Integración con WhatsApp

El sistema incluye funcionalidad para enviar recordatorios de membresías por WhatsApp:

1. En la página de Membresías, busca una membresía activa
2. Haz clic en el botón de WhatsApp (ícono verde)
3. Se abrirá WhatsApp con un mensaje pre-formateado
4. El mensaje incluye información de la membresía y fecha de vencimiento

## 🛠️ Desarrollo

### Estructura del Proyecto

```
src/
├── components/
│   └── GymNavbar.vue          # Navegación del sistema de gimnasios
├── composables/
│   └── useAuth.ts             # Autenticación (actualizado para roles)
├── pages/
│   ├── GymLogin.vue           # Login con selección de sucursal
│   ├── GymDashboard.vue        # Dashboard principal
│   ├── GymProductos.vue        # Gestión de productos
│   ├── GymVentas.vue          # Gestión de ventas
│   ├── GymMembresias.vue      # Gestión de membresías
│   └── GymReportes.vue         # Reportes
├── services/
│   └── gymApi.ts              # API para todas las operaciones
├── types/
│   └── gym.ts                 # Tipos TypeScript
└── utils/
    └── gymWhatsappService.ts  # Servicio de WhatsApp
```

### Rutas del Sistema

- `/gym/login` - Login
- `/gym/dashboard` - Dashboard
- `/gym/productos` - Productos
- `/gym/ventas` - Ventas
- `/gym/membresias` - Membresías
- `/gym/reportes` - Reportes

## 🔒 Seguridad

- Las políticas RLS (Row Level Security) están habilitadas en todas las tablas
- Los empleados solo pueden ver datos de su sucursal
- El superadmin puede ver datos de todas las sucursales
- Las contraseñas se almacenan en texto plano (mejorar en producción con hash)

## 📝 Notas Importantes

1. **Datos Dummy**: El schema SQL incluye datos de prueba para poder probar el sistema inmediatamente
2. **RLS**: Las políticas RLS están configuradas para permitir acceso público en desarrollo. Ajustar para producción
3. **Contraseñas**: En producción, implementar hash de contraseñas (bcrypt, etc.)
4. **WhatsApp**: Los recordatorios se envían mediante enlaces wa.me. No se requiere API de WhatsApp

## 🐛 Solución de Problemas

### Error al iniciar sesión
- Verifica que el schema SQL se haya ejecutado correctamente
- Verifica las credenciales en la tabla `empleados`
- Verifica que la sucursal esté activa

### Error al cargar datos
- Verifica las variables de entorno (VITE_SUPABASE_URL y VITE_SUPABASE_KEY)
- Verifica que las políticas RLS permitan el acceso
- Revisa la consola del navegador para errores específicos

## 📄 Licencia

Este proyecto mantiene la misma licencia que el proyecto base.
