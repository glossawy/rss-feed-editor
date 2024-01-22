import os

from flask import Flask, Blueprint
from flask_cors import CORS

from werkzeug.middleware.proxy_fix import ProxyFix

import feed_editor.rewrite as rewrite
import feed_editor.health_check as health_check


def create_app() -> Flask:
    app = Flask(__name__, instance_relative_config=True)

    # Allow all for CORS only if env var set
    if os.environ.get("APP_DISABLE_CORS", "0") == "1":
        CORS(app)

    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    blueprints: list[Blueprint] = [
        rewrite.blueprint,
        health_check.blueprint,
    ]

    for bp in blueprints:
        app.register_blueprint(bp)

    return app
