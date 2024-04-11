# pylint: disable=missing-function-docstring,redefined-outer-name

from typing import cast
from unittest.mock import MagicMock, patch

import pytest
from flask.testing import FlaskClient
from tests.support.fixture_types import (
    ConditionFactories,
    FeedFactory,
    FeedTransformFactory,
    JsonLoader,
    MutationFactories,
    RuleFactory,
)

from feed_editor.rewrite.compression import _gzip_encode, compress_and_encode
from feed_editor.rewrite.rules.types import FeedTransformDict
from feed_editor.rss.fetch import _to_etree


@pytest.fixture
def valid_feed_transform(
    rule_factory: RuleFactory,
    feed_transform_factory: FeedTransformFactory,
    mutation_factories: MutationFactories,
    condition_factories: ConditionFactories,
) -> FeedTransformDict:
    return feed_transform_factory(
        feed_url="https://example.fake",
        rules=[
            rule_factory(
                "webMaster",
                condition_factories.contains(contains="rule1"),
                [
                    mutation_factories.replace("rule1path"),
                    mutation_factories.remove(),
                ],
            ),
            rule_factory(
                "description",
                condition_factories.any_of(
                    [
                        condition_factories.contains(contains="rule2cond1"),
                        condition_factories.contains(contains="rule2cond2"),
                    ]
                ),
                [mutation_factories.replace("rule2path")],
            ),
        ],
    )


@pytest.fixture
def mock_rss_fetch():
    with patch("feed_editor.rewrite.rewriter.rss_fetch") as rss_fetch:
        yield rss_fetch


@pytest.fixture
def rss_rules(json_loader: JsonLoader) -> FeedTransformDict:
    return cast(FeedTransformDict, json_loader("rss_rules"))


def test_get__valid(
    client: FlaskClient,
    mock_rss_fetch: MagicMock,
    feed_factory: FeedFactory,
    valid_feed_transform: FeedTransformDict,
):
    feed = feed_factory("rss")
    mock_rss_fetch.return_value = feed

    response = client.get(
        "/rewrite/", query_string={"r": compress_and_encode(valid_feed_transform)}
    )

    assert response.status_code == 200
    assert response.headers["Content-Type"] == "application/rss+xml"
    assert response.text == feed.as_xml()
    mock_rss_fetch.assert_called_once_with(valid_feed_transform["feed_url"])


def test_get__no_encoded_value(client: FlaskClient, mock_rss_fetch: MagicMock):
    response = client.get("/rewrite/")

    assert response.status_code == 400
    mock_rss_fetch.assert_not_called()


def test_get__invalid_encoded_value(client: FlaskClient, mock_rss_fetch: MagicMock):
    invalid_encoded_dict = _gzip_encode({"test": "invalid"})
    response = client.get("/rewrite/", query_string={"r": invalid_encoded_dict})

    assert response.status_code == 400
    assert "Invalid encoded rules" in response.text
    mock_rss_fetch.assert_not_called()


def test_get__complex_rules(
    client: FlaskClient,
    mock_rss_fetch: MagicMock,
    feed_factory: FeedFactory,
    rss_rules: FeedTransformDict,
):
    feed = feed_factory("rss")
    feed_titles = [elem.text for elem in feed.tree.findall("channel/item/title")]

    mock_rss_fetch.return_value = feed

    response = client.get(
        "/rewrite/", query_string={"r": compress_and_encode(rss_rules)}
    )

    assert response.status_code == 200
    mock_rss_fetch.assert_called_once_with(rss_rules["feed_url"])

    response_tree = _to_etree(response.text)
    response_items = response_tree.findall("channel/item")
    response_titles = [
        elem.text for elem in response_tree.findall("channel/item/title")
    ]

    # By rules, one feed item should be removed
    assert len(response_items) == len(feed.tree.findall("channel/item")) - 1

    # All instance of NASA in titles replaced with ROSCOM
    assert any("NASA" in title for title in feed_titles if title is not None)
    assert all("NASA" not in title for title in response_titles if title is not None)
    assert any("ROSCOM" in title for title in response_titles if title is not None)


def test_rules__valid(client: FlaskClient, rss_rules: FeedTransformDict):
    encoded = compress_and_encode(rss_rules)

    response = client.get("/rewrite/rules", query_string={"r": encoded})

    assert response.status_code == 200
    assert response.json == rss_rules


def test_rules__no_encoded_value(client: FlaskClient):
    response = client.get("/rewrite/rules")
    assert response.status_code == 400


def test_rules__invalid_encoded_value(client: FlaskClient):
    response = client.get(
        "/rewrite/rules", query_string={"r": _gzip_encode({"invalid": "data"})}
    )
    assert response.status_code == 400


@pytest.mark.parametrize("excluded_field", ["feed_url", "rules"])
def test_url__missing_required_fields(client: FlaskClient, excluded_field):
    data = {"feed_url": "https://example.fake", "rules": []}
    del data[excluded_field]

    response = client.post("/rewrite/url", json=data)

    assert response.status_code == 400
    assert "Missing feed_url or rules" in response.text


def test_url__invalid_rules(client: FlaskClient):
    data = {"feed_url": "https://example.fake", "rules": [{"invalid": "rule"}]}

    response = client.post("/rewrite/url", json=data)

    assert response.status_code == 400
    assert "Invalid rules" in response.text


def test_url__invalid_xpaths(client: FlaskClient, rss_rules: FeedTransformDict):
    rss_rules["rules"][0]["xpath"] = ""

    response = client.post("/rewrite/url", json=rss_rules)

    assert response.status_code == 400
    assert "Invalid xpaths" in response.text


def test_url__valid_rules(client: FlaskClient, rss_rules: FeedTransformDict):
    response = client.post("/rewrite/url", json=rss_rules)

    assert response.status_code == 200
    assert response.text == compress_and_encode(rss_rules)
