
build:
	npm run build

start-locally: build
	docker compose up

dev-server:
	poetry run -C ./app flask -A feed_editor --debug run
