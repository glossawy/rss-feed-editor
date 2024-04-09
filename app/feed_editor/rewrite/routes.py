from typing import Mapping
from flask import current_app, Blueprint, request

import pydantic
from werkzeug.exceptions import BadRequest

from feed_editor.rewrite.compression import compress_and_encode, decode_and_decompress
from feed_editor.rewrite.rewriter import FeedRewriter
from feed_editor.rewrite.rules import validate_dict, validate_xpaths
from feed_editor.rewrite.rules.types import FeedRulesDict

rewrite_api = Blueprint("rewrite", __name__, url_prefix="/rewrite")


@rewrite_api.route("/", methods=["GET"])
def get():
    """Takes feed rules for a url and returns the rewritten feed as an XML string"""
    feed_rewriter = FeedRewriter(_parse_args(request.args))

    if not feed_rewriter.is_valid_feed:
        return "Feed URL must be a valid url", 400

    current_app.logger.info(f"Rewrote feed for {feed_rewriter.feed_url}")

    return (
        feed_rewriter.rewritten_feed.as_xml(),
        200,
        {"Content-Type": feed_rewriter.mime_type},
    )


@rewrite_api.route("/url", methods=["POST"])
def url():
    """Takes a url and feed transformations and returns a URL-safe compressed and
    encoded representation
    """
    request_json = request.json

    if (
        not request_json
        or not isinstance(request_json, dict)
        or "feed_url" not in request_json
        or "rules" not in request_json
    ):
        raise BadRequest("Missing feed_url or rules.")

    try:
        feed_dict = validate_dict(request_json)
    except pydantic.ValidationError:
        raise BadRequest("Invalid rules.")

    if not validate_xpaths(feed_dict):
        raise BadRequest("Invalid xpaths.")

    return compress_and_encode(feed_dict)


def _parse_args(params: Mapping[str, str]) -> FeedRulesDict:
    feed_data_gzipped: str | None = params.get("r", None)

    if feed_data_gzipped:
        try:
            return decode_and_decompress(feed_data_gzipped)
        except pydantic.ValidationError:
            raise BadRequest("Invalid encoded rules.")

    raise BadRequest()
