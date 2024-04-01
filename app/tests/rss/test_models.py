from typing import Callable

import pytest
from feed_editor.rss.models import Feed, FeedType
from lxml.etree import _ElementTree as ElementTree


@pytest.mark.parametrize(
    "fixture_name,feed_type",
    [
        ("atom", FeedType.ATOM),
        ("rss", FeedType.RSS),
    ],
)
def test_feed_from_root(
    feed_tree_factory: Callable[[str], ElementTree], fixture_name, feed_type
):
    tree = feed_tree_factory(fixture_name)
    feed = Feed.from_root(tree.getroot())

    assert feed.feed_type == feed_type
    assert feed.tree.getroot() is tree.getroot()


def test_feed_copy(feed_factory: Callable[[str], Feed]):
    feed = feed_factory("rss")
    copied = feed.copy()

    assert feed.feed_type == copied.feed_type
    assert feed.as_xml() == copied.as_xml()
