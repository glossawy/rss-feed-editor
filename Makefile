
lint-frontend:
	bun lint --fix

build-frontend: lint-frontend
	bun run build

build-image-frontend: build-frontend
	docker buildx build --platform linux/arm64,linux/amd64 -t glossawy/rss-feed-editor-frontend:1.0 -f Dockerfile.frontend . --load

build-image-backend:
	docker buildx build --platform linux/arm64,linux/amd64 -t glossawy/rss-feed-editor:1.0 -f Dockerfile . --load

build-images: build-image-frontend build-image-backend

start: build
	docker compose up

dev-frontend:
	bun run dev

dev-server:
	poetry run -C ./app flask -A feed_editor --debug run
