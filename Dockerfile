FROM python:3.12-alpine as base

ENV POETRY_NO_INTERACTION=1 \
  POETRY_VIRTUALENVS_IN_PROJECT=1 \
  PEOTRY_VIRTUALENVS_CREATE=0 \
  POETRY_CACHE_DIR=/tmp/poetry-cache \
  PATH="/app/.venv/bin:$PATH"

USER root

RUN mkdir /app
WORKDIR /app

FROM base as builder

# Setup build requirements
RUN apk add --no-cache build-base libffi-dev && \
  pip install poetry

COPY ./app /app/app
COPY ./pyproject.toml /app
COPY ./poetry.lock /app
COPY ./README.md /app

# Install poetry deps and app package via pip, install gunicorn
# this avoids needing the app source in the production image
RUN poetry export -f requirements.txt -o requirements.txt && \
  poetry build && \
  python -m venv /app/.venv && \
  pip install -r requirements.txt --compile && \
  pip install --compile dist/*.whl && \
  pip install --compile gunicorn

FROM base

# Setup necessary files to run app then run as gunicorn user
RUN addgroup gunicorn && \
  adduser -H -D -G gunicorn gunicorn

COPY ./gunicorn.conf.py /app
COPY --from=builder /app/.venv /app/.venv

USER gunicorn

CMD ["gunicorn", "-c", "/app/gunicorn.conf.py", "feed_editor:create_app()"]
