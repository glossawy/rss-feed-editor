import base64
import gzip
import json

from typing import Mapping
from flask import Blueprint, request

from werkzeug.exceptions import BadRequest
from feed_editor.utils.normalizers import normalize_xml

from feed_editor.rewrite.rewriter import FeedRewriter
from feed_editor.rewrite.rules import validate_dict, validate_xpaths
from feed_editor.rewrite.rules.types import FeedRulesDict

rewrite_api = Blueprint("rewrite", __name__, url_prefix="/rewrite")


@rewrite_api.route("/", methods=["GET"])
def get():
    feed_rewriter = FeedRewriter(_parse_args(request.args))

    if not feed_rewriter.is_valid_feed:
        return "Feed URL must be a valid url", 400

    return (
        normalize_xml(feed_rewriter.rewritten_feed.as_xml()),
        200,
        {"Content-Type": feed_rewriter.mime_type},
    )


@rewrite_api.route("/url", methods=["POST"])
def url():
    request_json = request.json

    if (
        not request_json
        or not isinstance(request_json, dict)
        or "feed_url" not in request_json
        or "rules" not in request_json
    ):
        return "Missing feed_url or rules", 400

    feed_dict = validate_dict(request_json)

    if not validate_xpaths(feed_dict):
        return "Invalid xpaths", 400

    return _url_encode_rules(feed_dict)


def _parse_args(params: Mapping[str, str]) -> FeedRulesDict:
    feed_data_gzipped: str | None = params.get("r", None)

    if feed_data_gzipped:
        return _url_decode_rules(feed_data_gzipped)
    else:
        raise BadRequest()


def _url_encode_rules(feed_dict: FeedRulesDict) -> str:
    feed_json = json.dumps(feed_dict)
    compressed = gzip.compress(feed_json.encode("utf-8"))
    encoded = base64.urlsafe_b64encode(compressed).decode("utf-8")

    return encoded


def _url_decode_rules(encoded: str) -> FeedRulesDict:
    compressed = base64.urlsafe_b64decode(encoded)
    feed_json = gzip.decompress(compressed).decode("utf-8")
    feed_dict = json.loads(feed_json)

    return validate_dict(feed_dict)
