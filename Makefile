
lint-frontend:
	bun lint --fix

lint-backend:
	poetry run isort ./app
	poetry run pylint ./app
	poetry run flake8 ./app

build-frontend: lint-frontend
	bun run build

build-image-frontend: lint-frontend
	docker buildx build --platform linux/arm64,linux/amd64 -t glossawy/rss-feed-editor-frontend:latest -f Dockerfile.frontend . --load

build-image-backend: lint-backend
	docker buildx build --platform linux/arm64,linux/amd64 -t glossawy/rss-feed-editor:latest -f Dockerfile . --load

build-images: build-image-frontend build-image-backend

build: build-frontend

start:
	docker compose build
	docker compose up

dev-frontend:
	bun run dev

dev-server:
	poetry run -C ./app flask -A feed_editor --debug run
