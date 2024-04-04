# pylint: disable=redefined-outer-name,protected-access

from pathlib import Path
from typing import cast

import pytest
from feed_editor.rss.models import Feed
from lxml import etree

from tests.support.fixture_types import FeedFactory, FeedTreeFactory, FeedXmlLoader

FIXTURES_PATH = Path(__file__).joinpath("..", "fixtures").resolve()


@pytest.fixture
def feed_xml_loader() -> FeedXmlLoader:
    def loader(feed_fixture_name: str):
        if not feed_fixture_name.endswith(".xml"):
            name = f"{feed_fixture_name}.xml"

        with open(FIXTURES_PATH.joinpath(name), "r", encoding="utf-8") as feed:
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
