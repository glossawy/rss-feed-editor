
build:
	npm run build

start-locally: build
	docker compose up

dev-server:
	npm run dev
