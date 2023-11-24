FROM python:3.11-alpine

EXPOSE 5000

RUN apk add --no-cache build-base libffi-dev
RUN pip install poetry

RUN mkdir /app
WORKDIR /app

COPY ./app /app/app
COPY ./pyproject.toml /app
COPY ./poetry.lock /app
COPY ./README.md /app
RUN poetry install

COPY ./scripts /app/scripts

CMD /app/scripts/entrypoint.sh
