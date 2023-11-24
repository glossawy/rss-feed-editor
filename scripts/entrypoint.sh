#!/bin/sh

cd ./app

poetry run flask -A feed_editor --debug run --host '0.0.0.0' --port 5000
