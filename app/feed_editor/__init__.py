import os

from flask import Flask, Blueprint
from flask_cors import CORS

import feed_editor.rewrite as rewrite
import feed_editor.feed_proxy as feed_proxy
import feed_editor.health_check as health_check


def create_app() -> Flask:
    app = Flask(__name__, instance_relative_config=True)

    # Allow all for CORS only if env var set
    if os.environ.get("APP_DISABLE_CORS", "0") == "1":
        CORS(app)

    blueprints: list[Blueprint] = [
        rewrite.blueprint,
        feed_proxy.blueprint,
        health_check.blueprint,
    ]

    for bp in blueprints:
        app.register_blueprint(bp)

    return app
