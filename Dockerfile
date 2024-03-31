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

CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:5000", "feed_editor:create_app()"]
