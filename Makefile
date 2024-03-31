
lint-frontend:
	bun lint --fix

lint-backend:
	poetry run pylint ./app
	poetry run flake8 ./app

build-frontend: lint-frontend
	bun run build

build-image-frontend: build-frontend
	docker buildx build --platform linux/arm64,linux/amd64 -t glossawy/rss-feed-editor-frontend:built -f Dockerfile.frontend . --load

build-image-backend: lint-backend
	docker buildx build --platform linux/arm64,linux/amd64 -t glossawy/rss-feed-editor:built -f Dockerfile . --load

build-images: build-image-frontend build-image-backend

start: build
	docker compose up

dev-frontend:
	bun run dev

dev-server:
	poetry run -C ./app flask -A feed_editor --debug run
