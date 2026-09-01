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
    availability: 'Disponibilidad',
    schedule: 'Agenda',
    signOut: 'Cerrar sesión',
  },

  auth: {
    signInTitle: 'Iniciar sesión',
    signingIn: 'Entrando…',
    signOut: 'Salir',
    // The mockup said 'token JWT'. This system uses a Better Auth session
    // cookie instead, so the copy says what actually happens.
    hint: 'La sesión viaja en una cookie firmada, no en un token en localStorage. El rol (admin o user) llega en la propia sesión.',
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
    deactivate: 'Dar de baja',
    editResource: 'Editar recurso',
    code: 'Código',
    codeHint: 'Identificador estable. Minúsculas, números y guiones. No se puede cambiar después.',
    timeZone: 'Zona horaria',
    description: 'Descripción',
    attributesHint: 'Atributos propios de este tipo de recurso.',
    edit: 'Editar',
    activate: 'Reactivar',
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
    user: 'Usuario',
    range: 'Rango',
    all: 'Todas',
    filterResource: 'Recurso',
    filterStatus: 'Estado',
    rowsPerPage: 'Filas por página',
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

  users: {
    title: 'Usuarios',
    name: 'Nombre',
    email: 'Correo',
    role: 'Rol',
    activeReservations: 'Reservas activas',
    roleAdmin: 'Administrador',
    roleUser: 'Usuario',
    newUser: 'Nuevo usuario',
    status: 'Estado',
    enabled: 'Activo',
    blocked: 'Bloqueado',
    ban: 'Bloquear',
    unban: 'Desbloquear',
    banTitle: 'Bloquear usuario',
    banReason: 'Motivo',
    banDays: 'Duracion en dias',
    banDaysHint: 'Vacio = bloqueo indefinido.',
    banWarning: (name: string, reservations: number) =>
      reservations > 0
        ? name +
          ' perdera el acceso de inmediato. Sus ' +
          reservations +
          ' reserva(s) futura(s) se mantienen: bloquear no cancela reservas.'
        : name + ' perdera el acceso de inmediato, incluida cualquier sesion abierta.',
    editUser: 'Editar usuario',
    edit: 'Editar',
    passwordConfirm: 'Repetir contrasena',
    passwordMismatch: 'Las contrasenas no coinciden.',
    passwordTooShort: 'Minimo 10 caracteres.',
    emailChangeWarning:
      'El correo es la credencial de acceso: al cambiarlo, esta persona tendra que entrar con el nuevo.',
    passwordHint: 'Minimo 10 caracteres.',
    emptyTitle: 'No hay usuarios',
    emptyBody: 'Se dan de alta desde la pantalla de acceso.',
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
