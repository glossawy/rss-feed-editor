FROM python:3.12-alpine as base

ENV POETRY_NO_INTERACTION=1 \
  POETRY_VIRTUALENVS_IN_PROJECT=1 \
  PEOTRY_VIRTUALENVS_CREATE=0 \
  POETRY_CACHE_DIR=/tmp/poetry-cache \
  PATH="/app/.venv/bin:$PATH"

USER root

RUN mkdir /app
WORKDIR /app


COPY ./gunicorn.conf.py /app


FROM base as builder

RUN apk add --no-cache build-base libffi-dev
# RUN python -m venv /app/.venv
RUN pip install poetry

COPY ./app /app/app
COPY ./pyproject.toml /app
COPY ./poetry.lock /app
COPY ./README.md /app

RUN poetry export -f requirements.txt -o requirements.txt && \
  poetry build && \
  python -m venv /app/.venv && \
  pip install -r requirements.txt --compile && \
  pip install --compile dist/*.whl && \
  pip install --compile gunicorn

FROM base

RUN addgroup gunicorn && \
  adduser -H -D -G gunicorn gunicorn

USER gunicorn

COPY --from=builder --chown=gunicorn:gunicorn /app/.venv /app/.venv

CMD ["gunicorn", "-c", "/app/gunicorn.conf.py", "feed_editor:create_app()"]
