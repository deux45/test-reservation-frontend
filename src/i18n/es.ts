/**
 * Every string the user reads lives here.
 *
 * Project convention: code, identifiers and comments in English; user-facing
 * copy in Spanish. Keeping the copy in one file makes it reviewable at a
 * glance and leaves the door open to real i18n without touching components.
 */
export const es = {
  app: {
    name: 'Reservas',
    tagline: 'Gestión de recursos compartidos',
  },

  nav: {
    resources: 'Recursos',
    reservations: 'Reservas',
    schedule: 'Agenda',
    signOut: 'Cerrar sesión',
  },

  auth: {
    signInTitle: 'Iniciar sesión',
    email: 'Correo electrónico',
    password: 'Contraseña',
    signIn: 'Entrar',
    signUp: 'Crear cuenta',
    invalidCredentials: 'El correo o la contraseña no son correctos.',
    sessionExpired: 'Tu sesión ha caducado. Vuelve a entrar.',
  },

  resources: {
    title: 'Recursos',
    newResource: 'Nuevo recurso',
    name: 'Nombre',
    type: 'Tipo',
    capacity: 'Capacidad',
    location: 'Ubicación',
    status: 'Estado',
    active: 'Activo',
    inactive: 'Dado de baja',
    searchPlaceholder: 'Buscar por nombre o código',
    emptyTitle: 'Todavía no hay recursos',
    emptyBody: 'Crea el primero para empezar a reservar.',
  },

  reservations: {
    title: 'Reservas',
    newReservation: 'Reservar',
    reservationTitle: 'Título',
    resource: 'Recurso',
    from: 'Desde',
    to: 'Hasta',
    attendees: 'Asistentes',
    notes: 'Notas',
    confirm: 'Confirmar reserva',
    cancel: 'Cancelar reserva',
    cancelReason: 'Motivo de la cancelación',
    confirmed: 'Reserva confirmada',
    cancelled: 'Reserva cancelada',
    statusConfirmed: 'Confirmada',
    statusCancelled: 'Cancelada',
    statusCompleted: 'Completada',
    emptyTitle: 'No hay reservas con esos filtros',
    emptyBody: 'Prueba a ampliar el rango de fechas o a quitar algún filtro.',
  },

  availability: {
    title: 'Disponibilidad',
    freeSlots: 'Horarios disponibles',
    otherSlots: 'Otros horarios disponibles',
    noSlots: 'No quedan horarios libres ese día.',
    pickSlot: 'Elige un horario',
  },

  errors: {
    // The 409 the whole system exists to produce. The API sends the exact
    // conflicting range, so the message can be specific instead of "error".
    overlap: 'Ese horario ya está reservado',
    overlapDetail: (from: string, to: string) => `El recurso está ocupado de ${from} a ${to}.`,
    outsideHours: 'El recurso no está disponible a esa hora.',
    resourceBlocked: 'El recurso está bloqueado en ese periodo.',
    capacityExceeded: 'El número de asistentes supera la capacidad del recurso.',
    limitReached: 'Has alcanzado tu límite de reservas activas.',
    inThePast: 'No se puede reservar en el pasado.',
    network: 'No se pudo conectar con el servidor. Revisa tu conexión.',
    unexpected: 'Se produjo un error inesperado. Inténtalo de nuevo.',
  },

  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    retry: 'Reintentar',
    loading: 'Cargando…',
    of: 'de',
    rowsPerPage: 'Filas por página',
  },
} as const;
