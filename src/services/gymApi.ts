import { supabase } from '@/utils/supabase';
import type {
  Sucursal,
  Empleado,
  Cliente,
  Producto,
  Venta,
  TipoMembresia,
  Membresia,
  PagoMembresia,
  ProductoForm,
  VentaForm,
  ClienteForm,
  MembresiaForm,
  PagoMembresiaForm,
  ReporteVentas,
  ReporteMembresias
} from '@/types/gym';

const DEBUG = true;

function log(msg: string, ...args: unknown[]) {
  if (DEBUG) console.log('[GymAPI]', msg, ...args);
}

// ============================================
// SUCURSALES
// ============================================

export async function fetchSucursales(): Promise<{ data: Sucursal[] | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('sucursales')
    .select('*')
    .eq('activa', true)
    .order('nombre');

  if (error) {
    log('fetchSucursales ERROR', error);
    return { data: null, error };
  }
  log('fetchSucursales OK', data?.length ?? 0);
  return { data: (data as Sucursal[]) || [], error: null };
}

// ============================================
// EMPLEADOS
// ============================================

export async function loginEmpleado(
  username: string,
  password: string
): Promise<{ data: Empleado | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('empleados')
    .select('*, sucursal:sucursales(*)')
    .eq('username', username)
    .eq('password', password)
    .eq('activo', true)
    .maybeSingle();

  if (error) {
    log('loginEmpleado ERROR', error);
    return { data: null, error };
  }

  if (!data) {
    return { data: null, error: { message: 'Usuario o contraseña incorrectos' } };
  }

  // Si es empleado, debe tener sucursal asignada
  // Si es superadmin, puede acceder sin sucursal (tiene acceso a todo)
  if (data.rol === 'empleado' && !data.sucursal_id) {
    return { data: null, error: { message: 'Empleado sin sucursal asignada. Contacta al administrador.' } };
  }

  log('loginEmpleado OK', data.username, 'Rol:', data.rol, 'Sucursal:', data.sucursal_id || 'Todas (superadmin)');
  return { data: data as Empleado, error: null };
}

// ============================================
// CLIENTES
// ============================================

export async function fetchClientes(sucursalId?: number | null): Promise<{ data: Cliente[] | null; error: { message: string } | null }> {
  let query = supabase
    .from('clientes')
    .select('*, sucursal:sucursales(*)')
    .order('nombre_completo');

  if (sucursalId) {
    query = query.eq('sucursal_id', sucursalId);
  }

  const { data, error } = await query;

  if (error) {
    log('fetchClientes ERROR', error);
    return { data: null, error };
  }
  log('fetchClientes OK', data?.length ?? 0);
  return { data: (data as Cliente[]) || [], error: null };
}

export async function createCliente(
  payload: ClienteForm & { sucursal_id: number }
): Promise<{ data: Cliente | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('clientes')
    .insert(payload)
    .select('*, sucursal:sucursales(*)')
    .single();

  if (error) {
    log('createCliente ERROR', error);
    return { data: null, error };
  }
  log('createCliente OK', data.id);
  return { data: data as Cliente, error: null };
}

export async function updateCliente(
  id: number,
  payload: Partial<ClienteForm>
): Promise<{ data: Cliente | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('clientes')
    .update(payload)
    .eq('id', id)
    .select('*, sucursal:sucursales(*)')
    .single();

  if (error) {
    log('updateCliente ERROR', error);
    return { data: null, error };
  }
  log('updateCliente OK', id);
  return { data: data as Cliente, error: null };
}

export async function deleteCliente(
  id: number
): Promise<{ error: { message: string } | null }> {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id);

  if (error) {
    log('deleteCliente ERROR', error);
    return { error };
  }
  log('deleteCliente OK', id);
  return { error: null };
}

// ============================================
// PRODUCTOS
// ============================================

export async function fetchProductos(sucursalId?: number | null): Promise<{ data: Producto[] | null; error: { message: string } | null }> {
  let query = supabase
    .from('productos')
    .select('*, sucursal:sucursales(*)')
    .order('nombre');

  if (sucursalId) {
    query = query.eq('sucursal_id', sucursalId);
  }

  const { data, error } = await query;

  if (error) {
    log('fetchProductos ERROR', error);
    return { data: null, error };
  }
  log('fetchProductos OK', data?.length ?? 0);
  return { data: (data as Producto[]) || [], error: null };
}

export async function createProducto(
  payload: ProductoForm & { sucursal_id: number }
): Promise<{ data: Producto | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('productos')
    .insert(payload)
    .select('*, sucursal:sucursales(*)')
    .single();

  if (error) {
    log('createProducto ERROR', error);
    return { data: null, error };
  }
  log('createProducto OK', data.id);
  return { data: data as Producto, error: null };
}

export async function updateProducto(
  id: number,
  payload: Partial<ProductoForm & { sucursal_id?: number }>
): Promise<{ data: Producto | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('productos')
    .update(payload)
    .eq('id', id)
    .select('*, sucursal:sucursales(*)')
    .single();

  if (error) {
    log('updateProducto ERROR', error);
    return { data: null, error };
  }
  log('updateProducto OK', id);
  return { data: data as Producto, error: null };
}

export async function deleteProducto(id: number): Promise<{ error: { message: string } | null }> {
  const { error } = await supabase.from('productos').delete().eq('id', id);

  if (error) {
    log('deleteProducto ERROR', error);
    return { error };
  }
  log('deleteProducto OK', id);
  return { error: null };
}

// ============================================
// VENTAS
// ============================================

export async function fetchVentas(
  sucursalId?: number | null,
  empleadoId?: number | null,
  fechaDesde?: string,
  fechaHasta?: string
): Promise<{ data: Venta[] | null; error: { message: string } | null }> {
  let query = supabase
    .from('ventas')
    .select('*, sucursal:sucursales(*), empleado:empleados(*), cliente:clientes(*), detalles:venta_detalles(*, producto:productos(*))')
    .order('fecha_venta', { ascending: false });

  if (sucursalId) {
    query = query.eq('sucursal_id', sucursalId);
  }
  if (empleadoId) {
    query = query.eq('empleado_id', empleadoId);
  }
  if (fechaDesde) {
    query = query.gte('fecha_venta', fechaDesde);
  }
  if (fechaHasta) {
    query = query.lte('fecha_venta', fechaHasta);
  }

  const { data, error } = await query;

  if (error) {
    log('fetchVentas ERROR', error);
    return { data: null, error };
  }
  log('fetchVentas OK', data?.length ?? 0);
  return { data: (data as Venta[]) || [], error: null };
}

export async function createVenta(
  payload: VentaForm & { sucursal_id: number; empleado_id: number }
): Promise<{ data: Venta | null; error: { message: string } | null }> {
  // Primero obtener los productos para calcular el total
  const productosIds = payload.productos.map(p => p.producto_id);
  const { data: productos, error: productosError } = await supabase
    .from('productos')
    .select('id, precio, stock')
    .in('id', productosIds);

  if (productosError || !productos) {
    return { data: null, error: { message: 'Error al obtener productos' } };
  }

  // Calcular total y verificar stock
  let total = 0;
  const detalles: Array<{ producto_id: number; cantidad: number; precio_unitario: number; subtotal: number }> = [];

  for (const item of payload.productos) {
    const producto = productos.find(p => p.id === item.producto_id);
    if (!producto) {
      return { data: null, error: { message: `Producto ${item.producto_id} no encontrado` } };
    }
    if (producto.stock < item.cantidad) {
      return { data: null, error: { message: `Stock insuficiente para ${producto.id}` } };
    }
    const subtotal = producto.precio * item.cantidad;
    total += subtotal;
    detalles.push({
      producto_id: item.producto_id,
      cantidad: item.cantidad,
      precio_unitario: producto.precio,
      subtotal
    });
  }

  // Crear la venta
  const { data: venta, error: ventaError } = await supabase
    .from('ventas')
    .insert({
      sucursal_id: payload.sucursal_id,
      empleado_id: payload.empleado_id,
      cliente_id: payload.cliente_id || null,
      total,
      estado_pago: payload.estado_pago,
      notas: payload.notas || null
    })
    .select()
    .single();

  if (ventaError || !venta) {
    log('createVenta ERROR', ventaError);
    return { data: null, error: ventaError || { message: 'Error al crear venta' } };
  }

  // Crear los detalles
  const detallesConVentaId = detalles.map(d => ({ ...d, venta_id: venta.id }));
  const { error: detallesError } = await supabase.from('venta_detalles').insert(detallesConVentaId);

  if (detallesError) {
    // Rollback: eliminar la venta creada
    await supabase.from('ventas').delete().eq('id', venta.id);
    log('createVenta ERROR en detalles', detallesError);
    return { data: null, error: detallesError };
  }

  // Actualizar stock de productos
  for (const item of payload.productos) {
    const producto = productos.find(p => p.id === item.producto_id);
    if (producto) {
      await supabase
        .from('productos')
        .update({ stock: producto.stock - item.cantidad })
        .eq('id', item.producto_id);
    }
  }

  // Obtener la venta completa
  const { data: ventaCompleta, error: fetchError } = await supabase
    .from('ventas')
    .select('*, sucursal:sucursales(*), empleado:empleados(*), cliente:clientes(*), detalles:venta_detalles(*, producto:productos(*))')
    .eq('id', venta.id)
    .single();

  if (fetchError) {
    log('createVenta ERROR al obtener venta completa', fetchError);
    return { data: null, error: fetchError };
  }

  log('createVenta OK', venta.id);
  return { data: ventaCompleta as Venta, error: null };
}

export async function updateVentaEstado(
  id: number,
  estado: 'pagado' | 'pendiente' | 'cancelado'
): Promise<{ data: Venta | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('ventas')
    .update({ estado_pago: estado })
    .eq('id', id)
    .select('*, sucursal:sucursales(*), empleado:empleados(*), cliente:clientes(*), detalles:venta_detalles(*, producto:productos(*))')
    .single();

  if (error) {
    log('updateVentaEstado ERROR', error);
    return { data: null, error };
  }
  log('updateVentaEstado OK', id);
  return { data: data as Venta, error: null };
}

// ============================================
// TIPOS DE MEMBRESÍA
// ============================================

export async function fetchTiposMembresia(): Promise<{ data: TipoMembresia[] | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('tipos_membresia')
    .select('*')
    .eq('activa', true)
    .order('precio_mensual');

  if (error) {
    log('fetchTiposMembresia ERROR', error);
    return { data: null, error };
  }
  log('fetchTiposMembresia OK', data?.length ?? 0);
  return { data: (data as TipoMembresia[]) || [], error: null };
}

// ============================================
// MEMBRESÍAS
// ============================================

export async function fetchMembresias(
  sucursalId?: number | null,
  estado?: string,
  clienteId?: number | null
): Promise<{ data: Membresia[] | null; error: { message: string } | null }> {
  let query = supabase
    .from('membresias')
    .select('*, cliente:clientes(*), sucursal:sucursales(*), tipo_membresia:tipos_membresia(*)')
    .order('fecha_vencimiento', { ascending: true });

  if (sucursalId) {
    query = query.eq('sucursal_id', sucursalId);
  }
  if (estado) {
    query = query.eq('estado', estado);
  }
  if (clienteId) {
    query = query.eq('cliente_id', clienteId);
  }

  const { data, error } = await query;

  if (error) {
    log('fetchMembresias ERROR', error);
    return { data: null, error };
  }
  log('fetchMembresias OK', data?.length ?? 0);
  return { data: (data as Membresia[]) || [], error: null };
}

export async function createMembresia(
  payload: MembresiaForm & { sucursal_id: number; fecha_vencimiento?: string }
): Promise<{ data: Membresia | null; error: { message: string } | null }> {
  let fechaVencimiento: string;

  // Si se proporciona fecha_vencimiento, usarla (membresía personalizada)
  if (payload.fecha_vencimiento) {
    fechaVencimiento = payload.fecha_vencimiento;
  } else {
    // Calcular fecha de vencimiento basada en el tipo de membresía
    const { data: tipoMembresia, error: tipoError } = await supabase
      .from('tipos_membresia')
      .select('duracion_dias')
      .eq('id', payload.tipo_membresia_id)
      .single();

    if (tipoError || !tipoMembresia) {
      return { data: null, error: { message: 'Tipo de membresía no encontrado' } };
    }

    const fechaInicio = new Date(payload.fecha_inicio);
    const fechaVenc = new Date(fechaInicio);
    fechaVenc.setDate(fechaVenc.getDate() + tipoMembresia.duracion_dias);
    fechaVencimiento = fechaVenc.toISOString().split('T')[0];
  }

  const { data, error } = await supabase
    .from('membresias')
    .insert({
      cliente_id: payload.cliente_id,
      tipo_membresia_id: payload.tipo_membresia_id,
      fecha_inicio: payload.fecha_inicio,
      fecha_vencimiento: fechaVencimiento,
      precio_mensual: payload.precio_mensual,
      sucursal_id: payload.sucursal_id,
      estado: 'activa'
    })
    .select('*, cliente:clientes(*), sucursal:sucursales(*), tipo_membresia:tipos_membresia(*)')
    .single();

  if (error) {
    log('createMembresia ERROR', error);
    return { data: null, error };
  }
  log('createMembresia OK', data.id);
  return { data: data as Membresia, error: null };
}

export async function updateMembresiaEstado(
  id: number,
  estado: 'activa' | 'vencida' | 'cancelada',
  fechaVencimiento?: string
): Promise<{ data: Membresia | null; error: { message: string } | null }> {
  const updateData: any = { estado };
  if (fechaVencimiento) {
    updateData.fecha_vencimiento = fechaVencimiento;
  }
  
  const { data, error } = await supabase
    .from('membresias')
    .update(updateData)
    .eq('id', id)
    .select('*, cliente:clientes(*), sucursal:sucursales(*), tipo_membresia:tipos_membresia(*)')
    .single();

  if (error) {
    log('updateMembresiaEstado ERROR', error);
    return { data: null, error };
  }
  log('updateMembresiaEstado OK', id);
  return { data: data as Membresia, error: null };
}

export async function updateMembresiaFechas(
  id: number,
  fechaInicio: string,
  fechaVencimiento: string
): Promise<{ data: Membresia | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('membresias')
    .update({
      fecha_inicio: fechaInicio,
      fecha_vencimiento: fechaVencimiento
    })
    .eq('id', id)
    .select('*, cliente:clientes(*), sucursal:sucursales(*), tipo_membresia:tipos_membresia(*)')
    .single();

  if (error) {
    log('updateMembresiaFechas ERROR', error);
    return { data: null, error };
  }
  log('updateMembresiaFechas OK', id);
  return { data: data as Membresia, error: null };
}

export async function deleteMembresia(id: number): Promise<{ error: { message: string } | null }> {
  const { error } = await supabase
    .from('membresias')
    .delete()
    .eq('id', id);

  if (error) {
    log('deleteMembresia ERROR', error);
    return { error };
  }
  log('deleteMembresia OK', id);
  return { error: null };
}

// ============================================
// PAGOS DE MEMBRESÍA
// ============================================

export async function fetchPagosMembresia(
  membresiaId?: number
): Promise<{ data: PagoMembresia[] | null; error: { message: string } | null }> {
  let query = supabase
    .from('pagos_membresia')
    .select('*, membresia:membresias(*, sucursal:sucursales(*)), empleado:empleados(*)')
    .order('fecha_pago', { ascending: false });

  if (membresiaId) {
    query = query.eq('membresia_id', membresiaId);
  }

  const { data, error } = await query;

  if (error) {
    log('fetchPagosMembresia ERROR', error);
    return { data: null, error };
  }
  log('fetchPagosMembresia OK', data?.length ?? 0);
  return { data: (data as PagoMembresia[]) || [], error: null };
}

export async function fetchPagosMembresiaConFiltros(
  sucursalId?: number | null,
  empleadoId?: number | null,
  fechaDesde?: string,
  fechaHasta?: string
): Promise<{ data: PagoMembresia[] | null; error: { message: string } | null }> {
  // Primero obtener los IDs de membresías de la sucursal si se especifica
  let membresiasIds: number[] | null = null;
  if (sucursalId) {
    const { data: membresias } = await supabase
      .from('membresias')
      .select('id')
      .eq('sucursal_id', sucursalId);
    
    if (membresias) {
      membresiasIds = membresias.map(m => m.id);
      if (membresiasIds.length === 0) {
        return { data: [], error: null };
      }
    }
  }

  let query = supabase
    .from('pagos_membresia')
    .select('*, membresia:membresias(*, sucursal:sucursales(*), cliente:clientes(*)), empleado:empleados(*)')
    .order('fecha_pago', { ascending: false });

  if (membresiasIds) {
    query = query.in('membresia_id', membresiasIds);
  }

  if (empleadoId) {
    query = query.eq('empleado_id', empleadoId);
  }

  if (fechaDesde) {
    query = query.gte('fecha_pago', fechaDesde);
  }

  if (fechaHasta) {
    query = query.lte('fecha_pago', fechaHasta);
  }

  const { data, error } = await query;

  if (error) {
    log('fetchPagosMembresiaConFiltros ERROR', error);
    return { data: null, error };
  }
  log('fetchPagosMembresiaConFiltros OK', data?.length ?? 0);
  return { data: (data as PagoMembresia[]) || [], error: null };
}

export async function createPagoMembresia(
  payload: PagoMembresiaForm & { empleado_id: number }
): Promise<{ data: PagoMembresia | null; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from('pagos_membresia')
    .insert({
      ...payload,
      empleado_id: payload.empleado_id
    })
    .select('*, membresia:membresias(*), empleado:empleados(*)')
    .single();

  if (error) {
    log('createPagoMembresia ERROR', error);
    return { data: null, error };
  }
  log('createPagoMembresia OK', data.id);
  return { data: data as PagoMembresia, error: null };
}

// ============================================
// REPORTES
// ============================================

export async function getReporteVentas(
  fechaDesde: string,
  fechaHasta: string,
  sucursalId?: number | null,
  empleadoId?: number | null
): Promise<{ data: ReporteVentas[] | null; error: { message: string } | null }> {
  const { data: ventas, error } = await fetchVentas(sucursalId, empleadoId, fechaDesde, fechaHasta);

  if (error || !ventas) {
    return { data: null, error: error || { message: 'Error al obtener ventas' } };
  }

  // Obtener también los pagos de membresías
  const { data: pagosMembresia } = await fetchPagosMembresiaConFiltros(
    sucursalId,
    empleadoId,
    fechaDesde,
    fechaHasta
  );

  // Agrupar por fecha y sucursal (si no hay filtro de sucursal, mostrar una fila por cada sucursal)
  const reporteMap = new Map<string, ReporteVentas>();

  // Agregar ventas de productos
  for (const venta of ventas) {
    const fecha = venta.fecha_venta.split('T')[0];
    // Si no hay filtro de sucursal, agrupar por fecha + sucursal; si hay filtro, solo por fecha
    const key = sucursalId ? fecha : `${fecha}_${venta.sucursal_id || 'null'}`;

    if (!reporteMap.has(key)) {
      reporteMap.set(key, {
        fecha,
        total: 0,
        cantidad_ventas: 0,
        cantidad_ventas_productos: 0,
        cantidad_ventas_membresias: 0,
        sucursal_id: venta.sucursal_id,
        sucursal_nombre: venta.sucursal?.nombre,
        empleado_id: venta.empleado_id,
        empleado_nombre: venta.empleado?.nombre_completo
      });
    }

    const reporte = reporteMap.get(key)!;
    reporte.total += venta.total;
    reporte.cantidad_ventas += 1;
    reporte.cantidad_ventas_productos += 1;
  }

  // Agregar pagos de membresías
  if (pagosMembresia) {
    for (const pago of pagosMembresia) {
      const fecha = pago.fecha_pago.split('T')[0];
      const sucursalIdPago = pago.membresia?.sucursal_id;
      // Si no hay filtro de sucursal, agrupar por fecha + sucursal; si hay filtro, solo por fecha
      const key = sucursalId ? fecha : `${fecha}_${sucursalIdPago || 'null'}`;

      if (!reporteMap.has(key)) {
        reporteMap.set(key, {
          fecha,
          total: 0,
          cantidad_ventas: 0,
          cantidad_ventas_productos: 0,
          cantidad_ventas_membresias: 0,
          sucursal_id: sucursalIdPago,
          sucursal_nombre: pago.membresia?.sucursal?.nombre,
          empleado_id: pago.empleado_id,
          empleado_nombre: pago.empleado?.nombre_completo
        });
      }

      const reporte = reporteMap.get(key)!;
      reporte.total += pago.monto;
      reporte.cantidad_ventas += 1;
      reporte.cantidad_ventas_membresias += 1;
    }
  }

  // Ordenar por fecha (descendente) y luego por sucursal_nombre (ascendente)
  const reporte = Array.from(reporteMap.values()).sort((a, b) => {
    const fechaCompare = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    if (fechaCompare !== 0) return fechaCompare;
    // Si las fechas son iguales, ordenar por nombre de sucursal
    const nombreA = a.sucursal_nombre || '';
    const nombreB = b.sucursal_nombre || '';
    return nombreA.localeCompare(nombreB);
  });

  return { data: reporte, error: null };
}

export async function getReporteMembresias(
  sucursalId?: number | null
): Promise<{ data: ReporteMembresias | null; error: { message: string } | null }> {
  const { data: membresias, error } = await fetchMembresias(sucursalId);

  if (error || !membresias) {
    return { data: null, error: error || { message: 'Error al obtener membresías' } };
  }

  // Calcular "por vencer" usando fechas normalizadas (sin zona horaria)
  const hoyStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const hoyDate = new Date(hoyStr + 'T00:00:00');
  const en7Dias = new Date(hoyDate);
  en7Dias.setDate(en7Dias.getDate() + 7);
  const en7DiasStr = en7Dias.toISOString().split('T')[0];
  
  const en15Dias = new Date(hoyDate);
  en15Dias.setDate(en15Dias.getDate() + 15);
  const en15DiasStr = en15Dias.toISOString().split('T')[0];

  const reporte: ReporteMembresias = {
    total_activas: 0,
    total_vencidas: 0,
    total_canceladas: 0,
    por_vencer_7_dias: 0,
    por_vencer_15_dias: 0
  };

  for (const membresia of membresias) {
    if (membresia.estado === 'activa') reporte.total_activas++;
    if (membresia.estado === 'vencida') reporte.total_vencidas++;
    if (membresia.estado === 'cancelada') reporte.total_canceladas++;

    if (membresia.estado === 'activa') {
      // Normalizar fecha de vencimiento a YYYY-MM-DD (sin zona horaria)
      let fechaVencimientoStr = '';
      if (typeof membresia.fecha_vencimiento === 'string') {
        const fechaStr = membresia.fecha_vencimiento.trim();
        if (fechaStr.includes('T')) {
          fechaVencimientoStr = fechaStr.split('T')[0];
        } else if (fechaStr.includes(' ')) {
          fechaVencimientoStr = fechaStr.split(' ')[0];
        } else {
          fechaVencimientoStr = fechaStr;
        }
      } else {
        const fecha = new Date(membresia.fecha_vencimiento);
        if (!isNaN(fecha.getTime())) {
          fechaVencimientoStr = fecha.toISOString().split('T')[0];
        }
      }
      
      if (fechaVencimientoStr) {
        // Comparar como strings: debe ser >= hoy y <= en7Dias/en15Dias
        if (fechaVencimientoStr >= hoyStr && fechaVencimientoStr <= en7DiasStr) {
          reporte.por_vencer_7_dias++;
        }
        if (fechaVencimientoStr >= hoyStr && fechaVencimientoStr <= en15DiasStr) {
          reporte.por_vencer_15_dias++;
        }
      }
    }
  }

  return { data: reporte, error: null };
}
