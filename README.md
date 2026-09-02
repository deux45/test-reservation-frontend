# Reservations web

Interfaz de gestión de recursos compartidos: recursos, reservas y usuarios.

Es un cliente de la [Reservations API](../test-reservation-backend). Toda la
lógica de negocio vive allí; aquí lo que se resuelve es que reservar sea rápido
y que los errores sean comprensibles.

- **Stack**: Next.js 16 (App Router) · React 19 · MUI 9 · TanStack Query 5 · TypeScript
- **Autenticación**: Better Auth, cookie de sesión firmada

---

## Arranque

Sólo hace falta Docker, y el repositorio de la API clonado al lado.

```bash
make start
```

Comprueba si la API está levantada y la arranca si no lo está —construyendo su
base de datos y cargando sus datos de demostración— antes de levantar la
interfaz. Un solo comando desde cero.

|          | URL                          |
| -------- | ---------------------------- |
| Interfaz | http://localhost:3001        |
| API      | http://localhost:3000/api/v1 |
| Swagger  | http://localhost:3000/docs   |

Entra con `admin@reservas.dev` / `Reservas2026!`. Hay dos cuentas sin permisos
de administración, `carlos@reservas.dev` y `marta@reservas.dev`, con la misma
contraseña, para ver la diferencia de permisos.

Si el backend está en otra ruta:

```bash
make start API_DIR=/ruta/a/test-reservation-backend
```

### Si no tienes `make`

Arranca primero la API (crea la red Docker que este compose usa) y luego:

```bash
docker compose up -d --build
```

En Windows, `make` se instala con `winget install GnuWin32.Make`, con Chocolatey
(`choco install make`) o usando WSL.

---

## Comandos

`make` sin argumentos lista todo. Los habituales:

| Comando          | Qué hace                                        |
| ---------------- | ----------------------------------------------- |
| `make start`     | Arranque completo, API incluida                 |
| `make logs`      | Sigue los logs                                  |
| `make test`      | Tests unitarios y de componentes                |
| `make check`     | Lo mismo que valida CI: tipos, lint y tests     |
| `make api-types` | Regenera los tipos desde el OpenAPI del backend |

---

## Pantallas

**Login** — correo y contraseña. La sesión viaja en una cookie firmada y
`httpOnly`, no en un token en `localStorage`: un XSS no puede leerla. El rol
llega en la propia sesión, así que la interfaz no decide quién es administrador,
sólo lo refleja.

**Recursos** — listado con alta, edición, baja lógica y reactivación. Un recurso
dado de baja se sigue viendo, marcado: no se borra nada que tenga historial.

**Reservas** — listado con filtros por recurso, estado y rango de fechas, más
paginación. Desde aquí se crea una reserva nueva y se cancela una existente.

**Usuarios** — sólo para administradores: alta con confirmación de contraseña,
edición, cambio de rol y bloqueo.

---

## El diálogo de reserva

Es la pantalla donde se concentran las decisiones interesantes, porque es donde
el usuario se topa con la regla de no solapamiento.

**Los huecos libres se ofrecen, no se adivinan.** Al elegir recurso y día, la
interfaz consulta `GET /resources/:id/availability` y muestra las franjas libres
como fichas pulsables. Escribir una hora a ciegas y que te digan que está
ocupada es una mala forma de reservar.

**El 409 sigue existiendo, y está bien que exista.** Entre la consulta y el
envío alguien puede reservar la misma franja; para eso está la restricción en la
base de datos. Lo que cambia es que deja de ser la forma normal de descubrir que
algo está ocupado y pasa a ser la carrera excepcional que debería ser. Cuando
ocurre, el diálogo no se cierra: muestra qué franja choca y refresca los huecos,
así que las alternativas están al lado del error.

**Cada apertura del diálogo genera un `Idempotency-Key`.** Uno por apertura, no
por intento, que es lo que convierte un doble clic en un reintento seguro en vez
de en dos reservas.

**Las horas son las del recurso, no las del navegador.** Una sala de Madrid
reservada desde Bogotá sigue significando las 10:00 en Madrid. La conversión
está aislada en `wallClockToUtc()` y es lo único que se prueba con nueve tests,
porque es donde este tipo de error se cuela sin que nadie lo note.

---

## Estructura

```
src/
├── app/                     Rutas del App Router
│   ├── (public)/login/      Sin sesión
│   └── (dashboard)/         Con sesión: resources, reservations, users
├── features/                Un directorio por área funcional
│   ├── auth/components/
│   ├── reservations/
│   │   ├── api/             Llamadas HTTP de esta área
│   │   └── components/      booking-dialog, free-slots, reservations-table
│   ├── resources/
│   ├── users/
│   └── shell/components/    Barra lateral, cabecera, pie de usuario
├── lib/
│   ├── api/                 client, errors, types
│   ├── auth-client.ts
│   └── dates.ts             Conversión de hora local a instante UTC
├── i18n/es.ts               Todo el texto visible, en un sitio
├── theme/                   Tema MUI y fuentes
└── middleware.ts            Protección de rutas
```

Dos convenciones que sostienen el resto:

**Las llamadas HTTP viven en `features/*/api`, nunca en un componente.** Un
componente que hace `fetch` es un componente que no se puede probar sin una red.

**Todo el texto visible está en `i18n/es.ts`.** El código está en inglés; lo que
lee el usuario, en español. Una cadena suelta en un componente es una cadena que
nadie encuentra cuando hay que cambiarla.

---

## Datos del servidor

TanStack Query gestiona todo lo que viene de la API. No hay estado global de
servidor duplicado en React: la caché de Query _es_ ese estado.

Las claves siguen la forma `['recurso', ...parámetros]`, por ejemplo
`['availability', resourceId, date]`. Incluir los parámetros en la clave es lo
que hace que volver a un día ya consultado se pinte desde caché en vez de
repetir la petición, y lo que permite invalidar con precisión: al crear una
reserva se invalidan `['reservations']` y `['availability']`, y sólo eso.

---

## Tipos de la API

Los tipos de las respuestas no se escriben a mano: se generan desde el
documento OpenAPI que publica el backend.

```bash
make api-types
```

Un cambio en un DTO del servidor se convierte en un error de compilación aquí,
en vez de en un `undefined` en tiempo de ejecución. Es la diferencia entre
enterarse al compilar y enterarse en producción.

---

## Tests

```bash
make test    # Vitest
make check   # tipos + lint + tests, lo mismo que CI
```

Playwright está instalado y `make e2e` existe, pero **la suite end-to-end aún
no está escrita**: hoy ese comando no ejecuta ningún test.

Los tests unitarios se centran en la lógica que puede fallar en silencio: la
conversión de zonas horarias, el formateo de rangos y el tratamiento de errores
de la API. Renderizar un botón y comprobar que pone «Guardar» no prueba nada que
el compilador no supiera ya.

---

## Cadena de suministro

Las mismas medidas que en el backend, por las mismas razones:

- `ignore-scripts=true` y `min-release-age=7` en `.npmrc`
- Versiones exactas, sin `^` ni `~`, y `npm ci` en todas partes
- `make audit` para vulnerabilidades conocidas y firmas del registro
- Acciones de GitHub fijadas por SHA
- Imagen de producción multi-etapa, con la salida `standalone` de Next y
  ejecutando como usuario sin privilegios

---

## Versionado

Commits convencionales validados por commitlint y `CHANGELOG.md` generado a
partir de ellos:

```bash
make release
```
