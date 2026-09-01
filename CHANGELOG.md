# Changelog

Todas las versiones de este proyecto se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el versionado sigue [Semantic Versioning](https://semver.org/lang/es/).

> Fichero generado por `commit-and-tag-version` a partir de los mensajes de
> commit. **No se edita a mano**: si una entrada está mal redactada, el problema
> está en el mensaje del commit.
>
> Cortar una versión: `npm run release` (o el workflow _Release_ en GitHub).

## [0.2.0](///compare/v0.1.0...v0.2.0) (2026-09-01)

### Funcionalidades

- **auth:** build the login screen against the real API 7b0c326
- **common:** convert a resource's wall clock to the UTC instant bd3c710
- **reservations:** add the booking dialog 5757847
- **reservations:** add the resources and reservations screens 016efa4
- **reservations:** offer free slots when booking 5b57f17
- **reservations:** show the date in the reservations list 69293b9
- **resources:** add the create and edit dialog ef8264a
- **resources:** drop the capacity field from the resource master 19a1eb2
- **resources:** drop the time zone field from the resource form effb8f9
- **resources:** remove the dynamic attributes form ced9a26
- **shell:** add the dashboard shell from the mockup 510555a
- **theme:** match the approved Material mockup 8ba3f05, references #1976d2
- **users:** add account creation and blocking to the users screen 3e096e4
- **users:** add an edit dialog and password confirmation fd85bfb
- **users:** add the users screen 3a55dd2

### Correcciones

- silence the hydration warning caused by browser extensions 5681aee

## 0.1.0 (2026-09-01)

### Funcionalidades

- add the App Router layout with MUI and Query providers e0d156c
- **api:** add a typed HTTP client with RFC 7807 error mapping 4a7b2b1
- **common:** format dates in the resource time zone 83ef103
- **i18n:** centralize Spanish user-facing copy b436aa1
- **theme:** add an MUI theme with light and dark schemes 08c2026

### Build y dependencias

- **docker:** add development and production images 3d7c5c9
