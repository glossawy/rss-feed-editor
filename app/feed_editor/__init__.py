from flask import Flask, Blueprint
from flask_cors import CORS

import feed_editor.rewrite as rewrite
import feed_editor.feed_proxy as feed_proxy


def create_app() -> Flask:
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)

    blueprints: list[Blueprint] = [rewrite.blueprint, feed_proxy.blueprint]

    for bp in blueprints:
        app.register_blueprint(bp)

    return app
