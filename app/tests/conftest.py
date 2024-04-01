# pylint: disable=redefined-outer-name,protected-access

from pathlib import Path
from typing import cast

import pytest
from feed_editor.rss.models import Feed
from lxml import etree

FIXTURES_PATH = Path(__file__).joinpath("..", "fixtures").resolve()


@pytest.fixture
def feed_xml_loader():
    def loader(name: str):
        if not name.endswith(".xml"):
            name = f"{name}.xml"

        with open(FIXTURES_PATH.joinpath(name), "r", encoding="utf-8") as feed:
            return feed.read()

    return loader


@pytest.fixture
def feed_tree_factory(feed_xml_loader):
    def factory(name: str):
        xmlparser = etree.XMLParser()
        xml = feed_xml_loader(name).encode("utf-8")
        return etree.ElementTree(cast(etree._Element, etree.fromstring(xml, xmlparser)))

    return factory


@pytest.fixture
def feed_factory(feed_tree_factory):
    def factory(name: str):
        tree = cast(etree._ElementTree, feed_tree_factory(name))
        return Feed.from_root(tree.getroot())

    return factory
