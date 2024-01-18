#!/bin/sh

poetry install

poetry run -C ./app flask -A feed_editor --debug run --host '0.0.0.0' --port 5000
