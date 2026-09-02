# Reservations web -- development and operations entry point.
#
# The contract of this file: someone who has just cloned both repositories and
# has nothing but Docker installed can run `make start` here and end up with a
# working interface, signed in against a migrated API with demo data.
#
# This project cannot stand alone -- it is a client. The compose file joins the
# `reservations-net` network created by the API repository, so `make start`
# checks that the API is up and starts it if it is not, rather than failing
# with an opaque "network not found".

SHELL := /bin/sh
.DEFAULT_GOAL := help

COMPOSE      := docker compose
COMPOSE_PROD := docker compose -f docker-compose.prod.yml
WEB          := $(COMPOSE) exec -T web

# Where the API repository lives. Override if it is checked out elsewhere:
#   make start API_DIR=../otro-sitio
API_DIR ?= ../test-reservation-backend

.PHONY: help start up down stop restart api-up logs shell \
        test test-watch test-cov e2e e2e-ui \
        lint format typecheck check audit api-types build prod-up prod-down \
        release clean

# -----------------------------------------------------------------------------
# Getting started
# -----------------------------------------------------------------------------

help: ## Muestra esta ayuda
	@echo "Reservations web"
	@echo ""
	@echo "Primer arranque:  make start"
	@echo ""
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

start: api-up up ## Arranque completo: API (si hace falta) e interfaz
	@echo ""
	@echo "  Web      http://localhost:3001"
	@echo "  API      http://localhost:3000"
	@echo "  Swagger  http://localhost:3000/docs"
	@echo ""
	@echo "  Entra con admin@reservas.dev / Reservas2026!"

api-up: ## Arranca la API si no está levantada (necesita el repo del backend)
	@if docker network inspect reservations-net >/dev/null 2>&1; then \
		echo "La API ya está levantada."; \
	elif [ -d "$(API_DIR)" ]; then \
		echo "Arrancando la API desde $(API_DIR)..."; \
		$(MAKE) -C "$(API_DIR)" start; \
	else \
		echo "No encuentro el repositorio de la API en $(API_DIR)."; \
		echo "Clónalo al lado de este, o indica dónde está:"; \
		echo "    make start API_DIR=/ruta/a/test-reservation-backend"; \
		exit 1; \
	fi

up: ## Levanta el contenedor de la interfaz
	$(COMPOSE) up -d --build
	@echo "Esperando a la interfaz..."
	@$(COMPOSE) exec -T web sh -c 'i=0; while [ $$i -lt 60 ]; do \
		wget -q -O /dev/null http://127.0.0.1:3001 2>/dev/null && exit 0; \
		i=$$((i+1)); sleep 2; done; \
		echo "La interfaz no respondió en 120s. Revisa: make logs"; exit 1'
	@echo "Interfaz lista."

down: ## Para el contenedor y borra sus volúmenes
	$(COMPOSE) down -v

stop: ## Para el contenedor conservando la caché de compilación
	$(COMPOSE) stop

restart: stop up ## Reinicia la interfaz

# -----------------------------------------------------------------------------
# Tests
# -----------------------------------------------------------------------------

test: ## Tests unitarios y de componentes (Vitest)
	$(WEB) npm test

test-watch: ## Tests en modo watch
	$(COMPOSE) exec web npm run test:watch

test-cov: ## Tests con cobertura
	$(WEB) npm run test:cov

e2e: ## Tests end-to-end (Playwright) contra la pila levantada
	$(WEB) npm run e2e

e2e-ui: ## Playwright en modo interactivo
	npm run e2e:ui

# -----------------------------------------------------------------------------
# Code quality
# -----------------------------------------------------------------------------

lint: ## ESLint con --fix
	$(WEB) npm run lint

format: ## Prettier
	$(WEB) npm run format

typecheck: ## Comprobación de tipos sin emitir
	$(WEB) npm run typecheck

check: typecheck lint test ## Todo lo que valida CI antes de un commit

audit: ## Vulnerabilidades conocidas y firmas del registro
	$(WEB) npm run audit:vulns
	$(WEB) npm run audit:signatures

api-types: ## Regenera los tipos de la API desde el openapi.json del backend
	@# Corre en el host: necesita leer el fichero del otro repositorio, que no
	@# está montado dentro del contenedor.
	$(MAKE) -C "$(API_DIR)" openapi
	npm run api:types

# -----------------------------------------------------------------------------
# Miscellaneous
# -----------------------------------------------------------------------------

logs: ## Sigue los logs de la interfaz
	$(COMPOSE) logs -f web

shell: ## Abre una shell dentro del contenedor
	$(COMPOSE) exec web sh

build: ## Construye la imagen de producción
	docker build -t reservations-web:local .

prod-up: ## Levanta la composición de producción
	$(COMPOSE_PROD) up -d

prod-down: ## Para la composición de producción
	$(COMPOSE_PROD) down

release: ## Corta una versión: CHANGELOG, bump y tag
	npm run release

clean: down ## Para todo y borra artefactos de compilación
	rm -rf .next coverage playwright-report tsconfig.tsbuildinfo
