
lint:
	bun lint --fix

build: lint
	bun run build

start: build
	docker compose up

dev-frontend:
	bun run dev

dev-server:
	poetry run -C ./app flask -A feed_editor --debug run
