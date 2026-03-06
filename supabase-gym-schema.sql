-- ============================================
-- SCHEMA PARA SUPABASE - SISTEMA DE GIMNASIOS
-- ============================================

-- Tabla de sucursales
CREATE TABLE IF NOT EXISTS public.sucursales (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de usuarios/empleados
CREATE TABLE IF NOT EXISTS public.empleados (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    nombre_completo VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(50) NOT NULL DEFAULT 'empleado', -- 'superadmin' o 'empleado'
    sucursal_id BIGINT REFERENCES public.sucursales(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id BIGSERIAL PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    fecha_nacimiento DATE,
    genero VARCHAR(20), -- 'masculino', 'femenino', 'otro'
    direccion TEXT,
    sucursal_id BIGINT NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS public.productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    categoria VARCHAR(100), -- 'suplementos', 'ropa', 'accesorios', 'bebidas', 'otros'
    estado VARCHAR(50) DEFAULT 'activo', -- 'activo', 'inactivo'
    sucursal_id BIGINT NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS public.ventas (
    id BIGSERIAL PRIMARY KEY,
    sucursal_id BIGINT NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
    empleado_id BIGINT NOT NULL REFERENCES public.empleados(id) ON DELETE RESTRICT,
    cliente_id BIGINT REFERENCES public.clientes(id) ON DELETE SET NULL,
    fecha_venta TIMESTAMPTZ DEFAULT NOW(),
    total DECIMAL(10, 2) NOT NULL,
    estado_pago VARCHAR(50) DEFAULT 'pendiente', -- 'pagado', 'pendiente', 'cancelado'
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de detalle de ventas (productos vendidos)
CREATE TABLE IF NOT EXISTS public.venta_detalles (
    id BIGSERIAL PRIMARY KEY,
    venta_id BIGINT NOT NULL REFERENCES public.ventas(id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de tipos de membresía
CREATE TABLE IF NOT EXISTS public.tipos_membresia (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio_mensual DECIMAL(10, 2) NOT NULL,
    duracion_dias INTEGER DEFAULT 30,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de membresías
CREATE TABLE IF NOT EXISTS public.membresias (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    sucursal_id BIGINT NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
    tipo_membresia_id BIGINT NOT NULL REFERENCES public.tipos_membresia(id) ON DELETE RESTRICT,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'activa', -- 'activa', 'vencida', 'cancelada'
    precio_mensual DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pagos de membresías
CREATE TABLE IF NOT EXISTS public.pagos_membresia (
    id BIGSERIAL PRIMARY KEY,
    membresia_id BIGINT NOT NULL REFERENCES public.membresias(id) ON DELETE CASCADE,
    empleado_id BIGINT NOT NULL REFERENCES public.empleados(id) ON DELETE RESTRICT,
    fecha_pago DATE NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    mes_pagado VARCHAR(20) NOT NULL, -- 'YYYY-MM' formato
    metodo_pago VARCHAR(50), -- 'efectivo', 'tarjeta', 'transferencia'
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de bitácoras del día
CREATE TABLE IF NOT EXISTS public.bitacoras_dia (
    id BIGSERIAL PRIMARY KEY,
    empleado_id BIGINT NOT NULL REFERENCES public.empleados(id) ON DELETE RESTRICT,
    fecha DATE NOT NULL,
    tipo VARCHAR(50) DEFAULT 'nota', -- 'incidente', 'nota', 'observacion', etc.
    descripcion TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_empleados_username ON public.empleados(username);
CREATE INDEX IF NOT EXISTS idx_empleados_sucursal ON public.empleados(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_empleados_rol ON public.empleados(rol);
CREATE INDEX IF NOT EXISTS idx_clientes_sucursal ON public.clientes(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON public.clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_productos_sucursal ON public.productos(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria);
CREATE INDEX IF NOT EXISTS idx_ventas_sucursal ON public.ventas(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_ventas_empleado ON public.ventas(empleado_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON public.ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_estado_pago ON public.ventas(estado_pago);
CREATE INDEX IF NOT EXISTS idx_venta_detalles_venta ON public.venta_detalles(venta_id);
CREATE INDEX IF NOT EXISTS idx_membresias_cliente ON public.membresias(cliente_id);
CREATE INDEX IF NOT EXISTS idx_membresias_sucursal ON public.membresias(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_membresias_estado ON public.membresias(estado);
CREATE INDEX IF NOT EXISTS idx_membresias_vencimiento ON public.membresias(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_pagos_membresia ON public.pagos_membresia(membresia_id);
CREATE INDEX IF NOT EXISTS idx_bitacoras_dia_empleado ON public.bitacoras_dia(empleado_id);
CREATE INDEX IF NOT EXISTS idx_bitacoras_dia_fecha ON public.bitacoras_dia(fecha);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_sucursales_updated_at
    BEFORE UPDATE ON public.sucursales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empleados_updated_at
    BEFORE UPDATE ON public.empleados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON public.clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at
    BEFORE UPDATE ON public.productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ventas_updated_at
    BEFORE UPDATE ON public.ventas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipos_membresia_updated_at
    BEFORE UPDATE ON public.tipos_membresia
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membresias_updated_at
    BEFORE UPDATE ON public.membresias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venta_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_membresia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membresias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_membresia ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir acceso público para desarrollo)
-- En producción, ajustar según necesidades de seguridad

-- Sucursales: lectura pública
CREATE POLICY "Permitir lectura pública de sucursales"
ON public.sucursales
FOR SELECT
TO anon, authenticated
USING (true);

-- Empleados: lectura pública (sin contraseña en SELECT)
CREATE POLICY "Permitir lectura pública de empleados"
ON public.empleados
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Permitir inserción de empleados"
ON public.empleados
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Permitir actualización de empleados"
ON public.empleados
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Clientes: acceso completo público
CREATE POLICY "Permitir acceso completo a clientes"
ON public.clientes
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Productos: acceso completo público
CREATE POLICY "Permitir acceso completo a productos"
ON public.productos
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Ventas: acceso completo público
CREATE POLICY "Permitir acceso completo a ventas"
ON public.ventas
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Venta detalles: acceso completo público
CREATE POLICY "Permitir acceso completo a venta_detalles"
ON public.venta_detalles
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Tipos membresía: acceso completo público
CREATE POLICY "Permitir acceso completo a tipos_membresia"
ON public.tipos_membresia
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Membresías: acceso completo público
CREATE POLICY "Permitir acceso completo a membresias"
ON public.membresias
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Pagos membresía: acceso completo público
CREATE POLICY "Permitir acceso completo a pagos_membresia"
ON public.pagos_membresia
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- DATOS DUMMY PARA PRUEBAS
-- ============================================

-- Insertar sucursales
INSERT INTO public.sucursales (nombre, direccion, telefono, email)
VALUES 
    ('Gym Central', 'Av. Principal 123, Centro', '9511234567', 'central@gym.com'),
    ('Gym Norte', 'Calle Norte 456, Col. Norte', '9512345678', 'norte@gym.com'),
    ('Gym Sur', 'Boulevard Sur 789, Col. Sur', '9513456789', 'sur@gym.com')
ON CONFLICT DO NOTHING;

-- Insertar tipos de membresía
INSERT INTO public.tipos_membresia (nombre, descripcion, precio_mensual, duracion_dias)
VALUES 
    ('Mensual Básica', 'Acceso a todas las instalaciones, horario regular', 500.00, 30),
    ('Mensual Premium', 'Acceso completo + clases grupales + entrenador personal', 800.00, 30),
    ('Trimestral Básica', '3 meses de acceso básico con descuento', 1350.00, 90),
    ('Anual Premium', '12 meses premium con máximo descuento', 8000.00, 365)
ON CONFLICT DO NOTHING;

-- Insertar empleados (incluyendo superadmin)
INSERT INTO public.empleados (username, password, email, nombre_completo, telefono, rol, sucursal_id)
SELECT 
    'superadmin',
    'admin123',
    'admin@gym.com',
    'Super Administrador',
    '9519999999',
    'superadmin',
    NULL
WHERE NOT EXISTS (SELECT 1 FROM public.empleados WHERE username = 'superadmin');

INSERT INTO public.empleados (username, password, email, nombre_completo, telefono, rol, sucursal_id)
SELECT 
    'empleado1',
    'empleado123',
    'empleado1@gym.com',
    'Juan Pérez',
    '9511111111',
    'empleado',
    s.id
FROM public.sucursales s 
WHERE s.nombre = 'Gym Central' 
  AND NOT EXISTS (SELECT 1 FROM public.empleados WHERE username = 'empleado1')
LIMIT 1;

INSERT INTO public.empleados (username, password, email, nombre_completo, telefono, rol, sucursal_id)
SELECT 
    'empleado2',
    'empleado123',
    'empleado2@gym.com',
    'María García',
    '9512222222',
    'empleado',
    s.id
FROM public.sucursales s 
WHERE s.nombre = 'Gym Norte' 
  AND NOT EXISTS (SELECT 1 FROM public.empleados WHERE username = 'empleado2')
LIMIT 1;

INSERT INTO public.empleados (username, password, email, nombre_completo, telefono, rol, sucursal_id)
SELECT 
    'empleado3',
    'empleado123',
    'empleado3@gym.com',
    'Carlos López',
    '9513333333',
    'empleado',
    s.id
FROM public.sucursales s 
WHERE s.nombre = 'Gym Sur' 
  AND NOT EXISTS (SELECT 1 FROM public.empleados WHERE username = 'empleado3')
LIMIT 1;

-- Insertar clientes
INSERT INTO public.clientes (nombre_completo, email, telefono, whatsapp, fecha_nacimiento, genero, direccion, sucursal_id)
SELECT 
    'Ana Martínez',
    'ana.martinez@email.com',
    '9514444444',
    '9514444444',
    '1990-05-15',
    'femenino',
    'Calle Ejemplo 123',
    s.id
FROM public.sucursales s 
WHERE s.nombre = 'Gym Central' 
  AND NOT EXISTS (SELECT 1 FROM public.clientes WHERE nombre_completo = 'Ana Martínez' AND telefono = '9514444444')
LIMIT 1;

INSERT INTO public.clientes (nombre_completo, email, telefono, whatsapp, fecha_nacimiento, genero, direccion, sucursal_id)
SELECT 
    'Roberto Sánchez',
    'roberto.sanchez@email.com',
    '9515555555',
    '9515555555',
    '1985-08-20',
    'masculino',
    'Av. Ejemplo 456',
    s.id
FROM public.sucursales s 
WHERE s.nombre = 'Gym Norte' 
  AND NOT EXISTS (SELECT 1 FROM public.clientes WHERE nombre_completo = 'Roberto Sánchez' AND telefono = '9515555555')
LIMIT 1;

INSERT INTO public.clientes (nombre_completo, email, telefono, whatsapp, fecha_nacimiento, genero, direccion, sucursal_id)
SELECT 
    'Laura Hernández',
    'laura.hernandez@email.com',
    '9516666666',
    '9516666666',
    '1992-11-10',
    'femenino',
    'Boulevard Ejemplo 789',
    s.id
FROM public.sucursales s 
WHERE s.nombre = 'Gym Sur' 
  AND NOT EXISTS (SELECT 1 FROM public.clientes WHERE nombre_completo = 'Laura Hernández' AND telefono = '9516666666')
LIMIT 1;

INSERT INTO public.clientes (nombre_completo, email, telefono, whatsapp, fecha_nacimiento, genero, direccion, sucursal_id)
SELECT 
    'Pedro Ramírez',
    'pedro.ramirez@email.com',
    '9517777777',
    '9517777777',
    '1988-03-25',
    'masculino',
    'Calle Test 321',
    s.id
FROM public.sucursales s 
WHERE s.nombre = 'Gym Central' 
  AND NOT EXISTS (SELECT 1 FROM public.clientes WHERE nombre_completo = 'Pedro Ramírez' AND telefono = '9517777777')
LIMIT 1;

INSERT INTO public.clientes (nombre_completo, email, telefono, whatsapp, fecha_nacimiento, genero, direccion, sucursal_id)
SELECT 
    'Sofía Torres',
    'sofia.torres@email.com',
    '9518888888',
    '9518888888',
    '1995-07-30',
    'femenino',
    'Av. Test 654',
    s.id
FROM public.sucursales s 
WHERE s.nombre = 'Gym Norte' 
  AND NOT EXISTS (SELECT 1 FROM public.clientes WHERE nombre_completo = 'Sofía Torres' AND telefono = '9518888888')
LIMIT 1;

-- Insertar productos
INSERT INTO public.productos (nombre, descripcion, precio, stock, categoria, sucursal_id)
SELECT 
    'Proteína Whey 1kg',
    'Proteína de suero de leche, sabor chocolate',
    450.00,
    25,
    'suplementos',
    s.id
FROM public.sucursales s WHERE s.nombre = 'Gym Central' LIMIT 1;

INSERT INTO public.productos (nombre, descripcion, precio, stock, categoria, sucursal_id)
SELECT 
    'Creatina Monohidrato 300g',
    'Creatina pura para aumento de fuerza',
    350.00,
    15,
    'suplementos',
    s.id
FROM public.sucursales s WHERE s.nombre = 'Gym Central' LIMIT 1;

INSERT INTO public.productos (nombre, descripcion, precio, stock, categoria, sucursal_id)
SELECT 
    'Shaker 700ml',
    'Vaso mezclador con tapa hermética',
    120.00,
    30,
    'accesorios',
    s.id
FROM public.sucursales s WHERE s.nombre = 'Gym Central' LIMIT 1;

INSERT INTO public.productos (nombre, descripcion, precio, stock, categoria, sucursal_id)
SELECT 
    'Guantes de entrenamiento',
    'Guantes con protección para palmas',
    250.00,
    20,
    'accesorios',
    s.id
FROM public.sucursales s WHERE s.nombre = 'Gym Norte' LIMIT 1;

INSERT INTO public.productos (nombre, descripcion, precio, stock, categoria, sucursal_id)
SELECT 
    'Agua embotellada 500ml',
    'Agua purificada',
    15.00,
    100,
    'bebidas',
    s.id
FROM public.sucursales s WHERE s.nombre = 'Gym Norte' LIMIT 1;

INSERT INTO public.productos (nombre, descripcion, precio, stock, categoria, sucursal_id)
SELECT 
    'Bebida energética',
    'Bebida isotónica para recuperación',
    35.00,
    50,
    'bebidas',
    s.id
FROM public.sucursales s WHERE s.nombre = 'Gym Sur' LIMIT 1;

INSERT INTO public.productos (nombre, descripcion, precio, stock, categoria, sucursal_id)
SELECT 
    'Camiseta Gym',
    'Camiseta oficial del gimnasio',
    200.00,
    40,
    'ropa',
    s.id
FROM public.sucursales s WHERE s.nombre = 'Gym Sur' LIMIT 1;
-- Insertar membresías
INSERT INTO public.membresias (cliente_id, sucursal_id, tipo_membresia_id, fecha_inicio, fecha_vencimiento, estado, precio_mensual)
SELECT 
    c.id,
    c.sucursal_id,
    tm.id,
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '15 days',
    'activa',
    tm.precio_mensual
FROM public.clientes c
CROSS JOIN public.tipos_membresia tm
WHERE c.nombre_completo = 'Ana Martínez' AND tm.nombre = 'Mensual Premium'
LIMIT 1;

INSERT INTO public.membresias (cliente_id, sucursal_id, tipo_membresia_id, fecha_inicio, fecha_vencimiento, estado, precio_mensual)
SELECT 
    c.id,
    c.sucursal_id,
    tm.id,
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '25 days',
    'activa',
    tm.precio_mensual
FROM public.clientes c
CROSS JOIN public.tipos_membresia tm
WHERE c.nombre_completo = 'Roberto Sánchez' AND tm.nombre = 'Mensual Básica'
LIMIT 1;

INSERT INTO public.membresias (cliente_id, sucursal_id, tipo_membresia_id, fecha_inicio, fecha_vencimiento, estado, precio_mensual)
SELECT 
    c.id,
    c.sucursal_id,
    tm.id,
    CURRENT_DATE - INTERVAL '35 days',
    CURRENT_DATE - INTERVAL '5 days',
    'vencida',
    tm.precio_mensual
FROM public.clientes c
CROSS JOIN public.tipos_membresia tm
WHERE c.nombre_completo = 'Laura Hernández' AND tm.nombre = 'Mensual Básica'
LIMIT 1;

INSERT INTO public.membresias (cliente_id, sucursal_id, tipo_membresia_id, fecha_inicio, fecha_vencimiento, estado, precio_mensual)
SELECT 
    c.id,
    c.sucursal_id,
    tm.id,
    CURRENT_DATE - INTERVAL '20 days',
    CURRENT_DATE + INTERVAL '10 days',
    'activa',
    tm.precio_mensual
FROM public.clientes c
CROSS JOIN public.tipos_membresia tm
WHERE c.nombre_completo = 'Pedro Ramírez' AND tm.nombre = 'Trimestral Básica'
LIMIT 1;

INSERT INTO public.membresias (cliente_id, sucursal_id, tipo_membresia_id, fecha_inicio, fecha_vencimiento, estado, precio_mensual)
SELECT 
    c.id,
    c.sucursal_id,
    tm.id,
    CURRENT_DATE - INTERVAL '60 days',
    CURRENT_DATE - INTERVAL '30 days',
    'cancelada',
    tm.precio_mensual
FROM public.clientes c
CROSS JOIN public.tipos_membresia tm
WHERE c.nombre_completo = 'Sofía Torres' AND tm.nombre = 'Mensual Premium'
LIMIT 1;
-- Insertar pagos de membresías
INSERT INTO public.pagos_membresia (membresia_id, empleado_id, fecha_pago, monto, mes_pagado, metodo_pago)
SELECT 
    m.id,
    e.id,
    m.fecha_inicio,
    m.precio_mensual,
    TO_CHAR(m.fecha_inicio, 'YYYY-MM'),
    'efectivo'
FROM public.membresias m
JOIN public.empleados e ON e.sucursal_id = m.sucursal_id
WHERE m.estado IN ('activa', 'vencida')
LIMIT 5;

-- Insertar ventas de ejemplo
INSERT INTO public.ventas (sucursal_id, empleado_id, cliente_id, fecha_venta, total, estado_pago)
SELECT 
    s.id,
    e.id,
    c.id,
    CURRENT_DATE - INTERVAL '2 days',
    450.00,
    'pagado'
FROM public.sucursales s
JOIN public.empleados e ON e.sucursal_id = s.id
JOIN public.clientes c ON c.sucursal_id = s.id
WHERE s.nombre = 'Gym Central' AND c.nombre_completo = 'Ana Martínez'
LIMIT 1;

INSERT INTO public.ventas (sucursal_id, empleado_id, cliente_id, fecha_venta, total, estado_pago)
SELECT 
    s.id,
    e.id,
    c.id,
    CURRENT_DATE - INTERVAL '1 day',
    120.00,
    'pagado'
FROM public.sucursales s
JOIN public.empleados e ON e.sucursal_id = s.id
JOIN public.clientes c ON c.sucursal_id = s.id
WHERE s.nombre = 'Gym Norte' AND c.nombre_completo = 'Roberto Sánchez'
LIMIT 1;

INSERT INTO public.ventas (sucursal_id, empleado_id, cliente_id, fecha_venta, total, estado_pago)
SELECT 
    s.id,
    e.id,
    NULL,
    CURRENT_DATE,
    35.00,
    'pendiente'
FROM public.sucursales s
JOIN public.empleados e ON e.sucursal_id = s.id
WHERE s.nombre = 'Gym Sur'
LIMIT 1;

-- Insertar detalles de ventas
INSERT INTO public.venta_detalles (venta_id, producto_id, cantidad, precio_unitario, subtotal)
SELECT 
    v.id,
    p.id,
    1,
    p.precio,
    p.precio
FROM public.ventas v
JOIN public.productos p ON p.sucursal_id = v.sucursal_id
WHERE v.total = 450.00 AND p.nombre = 'Proteína Whey 1kg'
LIMIT 1;

INSERT INTO public.venta_detalles (venta_id, producto_id, cantidad, precio_unitario, subtotal)
SELECT 
    v.id,
    p.id,
    1,
    p.precio,
    p.precio
FROM public.ventas v
JOIN public.productos p ON p.sucursal_id = v.sucursal_id
WHERE v.total = 120.00 AND p.nombre = 'Shaker 700ml'
LIMIT 1;

INSERT INTO public.venta_detalles (venta_id, producto_id, cantidad, precio_unitario, subtotal)
SELECT 
    v.id,
    p.id,
    1,
    p.precio,
    p.precio
FROM public.ventas v
JOIN public.productos p ON p.sucursal_id = v.sucursal_id
WHERE v.total = 35.00 AND p.nombre = 'Bebida energética'
LIMIT 1;
-- ============================================
-- COMENTARIOS Y NOTAS
-- ============================================
-- 
-- CREDENCIALES DE ACCESO:
-- Superadmin: username='superadmin', password='admin123'
-- Empleados: username='empleado1/2/3', password='empleado123'
--
-- Las políticas RLS están configuradas para permitir acceso público.
-- Para producción, ajustar las políticas según necesidades de seguridad.
--
-- Los datos dummy incluyen:
-- - 3 sucursales
-- - 1 superadmin + 3 empleados (uno por sucursal)
-- - 5 clientes distribuidos en las sucursales
-- - 7 productos en diferentes categorías
-- - 5 membresías con diferentes estados (activa, vencida, cancelada)
-- - 3 ventas de ejemplo con sus detalles
-- - Pagos de membresías asociados
--
-- Para desactivar RLS temporalmente (solo desarrollo):
-- ALTER TABLE public.sucursales DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.empleados DISABLE ROW LEVEL SECURITY;
-- ... (repetir para cada tabla)
