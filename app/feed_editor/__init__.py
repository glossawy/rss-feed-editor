import os

from flask import Flask, Blueprint
from flask_cors import CORS

from werkzeug.middleware.proxy_fix import ProxyFix

from feed_editor import rewrite, health_check


def create_app() -> Flask:  # pylint: disable=missing-function-docstring
    app = Flask(__name__, instance_relative_config=True)

    # Allow all for CORS only if env var set
    if os.environ.get("APP_DISABLE_CORS", "0") == "1":
        CORS(app)

    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=2, x_proto=2, x_host=2, x_prefix=2)

    blueprints: list[Blueprint] = [
        rewrite.blueprint,
        health_check.blueprint,
    ]

    for blueprint in blueprints:
        app.register_blueprint(blueprint)

    return app
