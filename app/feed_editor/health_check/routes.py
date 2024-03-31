from flask import Blueprint

health_check_api = Blueprint("health_check", __name__, url_prefix="/health")


@health_check_api.route("/ping")
def ping():
    """Responds with Pong! to a ping request."""
    return "Pong!", 200
