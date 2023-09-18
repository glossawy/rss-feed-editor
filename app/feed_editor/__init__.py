from flask import Flask, Blueprint
from flask_cors import CORS

from . import rewrite


def create_app() -> Flask:
    app = Flask(__name__, instance_relative_config=True)
    CORS(app)

    blueprints: list[Blueprint] = [rewrite.blueprint]

    for bp in blueprints:
        app.register_blueprint(bp)

    return app
