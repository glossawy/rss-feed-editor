from flask.testing import FlaskClient


def test_ping(client: FlaskClient):
    response = client.get("/health/ping")

    assert response.status_code == 200
    assert response.text == "Pong!"
