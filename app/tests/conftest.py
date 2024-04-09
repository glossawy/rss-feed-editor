# pylint: disable=redefined-outer-name,protected-access,missing-function-docstring

import json
from pathlib import Path
from typing import cast

import pytest
from flask import Flask
from flask.testing import FlaskClient, FlaskCliRunner
from lxml import etree
from tests.support.fixture_types import (
    FeedFactory,
    FeedTreeFactory,
    FeedXmlLoader,
    JsonLoader,
)

from feed_editor import create_app
from feed_editor.rss.models import Feed

FIXTURES_PATH = Path(__file__).joinpath("..", "fixtures").resolve()


@pytest.fixture
def app() -> Flask:
    app = create_app()
    app.config.update({"TESTING": True})

    return app


@pytest.fixture
def client(app: Flask) -> FlaskClient:
    return app.test_client()


@pytest.fixture
def runner(app: Flask) -> FlaskCliRunner:
    return app.test_cli_runner()


@pytest.fixture
def json_loader() -> JsonLoader:
    def loader(fixture_name: str):
        if not fixture_name.endswith(".json"):
            fixture_name = f"{fixture_name}.json"

        with open(
            FIXTURES_PATH.joinpath(fixture_name), "r", encoding="utf-8"
        ) as jsonfile:
            return json.loads(jsonfile.read())

    return loader


@pytest.fixture
def feed_xml_loader() -> FeedXmlLoader:
    def loader(feed_fixture_name: str):
        if not feed_fixture_name.endswith(".xml"):
            feed_fixture_name = f"{feed_fixture_name}.xml"

        with open(
            FIXTURES_PATH.joinpath(feed_fixture_name), "r", encoding="utf-8"
        ) as feed:
            return feed.read()

    return loader


@pytest.fixture
def feed_tree_factory(feed_xml_loader) -> FeedTreeFactory:
    def factory(feed_fixture_name: str):
        xmlparser = etree.XMLParser()
        xml = feed_xml_loader(feed_fixture_name).encode("utf-8")
        return etree.ElementTree(cast(etree._Element, etree.fromstring(xml, xmlparser)))

    return factory


@pytest.fixture
def feed_factory(feed_tree_factory) -> FeedFactory:
    def factory(feed_fixture_name: str):
        tree = cast(etree._ElementTree, feed_tree_factory(feed_fixture_name))
        return Feed.from_root(tree.getroot())

    return factory
