# DashOffice Makefile

.PHONY: help build run test clean docker

help:
	@echo "DashOffice - Sistema Empresarial"
	@echo ""
	@echo "Comandos disponibles:"
	@echo "  make build    - Compilar todos los servicios"
	@echo "  make run      - Ejecutar servicios"
	@echo "  make test     - Ejecutar tests"
	@echo "  make docker   - Build Docker images"
	@echo "  make clean    - Limpiar builds"

build:
	cargo build --release --workspace

run:
	cargo run --bin api-gateway

test:
	cargo test --workspace

docker:
	docker-compose build

clean:
	cargo clean
