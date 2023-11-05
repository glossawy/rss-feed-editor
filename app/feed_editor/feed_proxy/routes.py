import urllib.parse as urlparse

import httpx
from flask import Blueprint, request

from app.feed_editor.utils.normalizers import normalize_xml


proxy_api = Blueprint("feed_proxy", __name__, url_prefix="/_proxy")


@proxy_api.route("/")
def proxy_rss_feed():
    feed_url = request.args.get("url")

    if feed_url is None:
        return "No feed url provided", 400

    feed_url = urlparse.unquote(feed_url)
    response = httpx.get(feed_url)

    if response.is_success:
        return normalize_xml(response.text), 200
    else:
        return "Upstream returned an error", response.status_code
