FROM python:3.11-alpine

EXPOSE 5000

RUN apk add --no-cache build-base libffi-dev
RUN pip install gunicorn

RUN mkdir /app
WORKDIR /app

COPY ./app /app/app
COPY ./pyproject.toml /app
COPY ./poetry.lock /app
COPY ./README.md /app

RUN pip install .

COPY ./gunicorn.conf.py /app

CMD ["gunicorn", "-c", "/app/gunicorn.conf.py", "feed_editor:create_app()"]
