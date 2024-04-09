# pylint: disable=redefined-outer-name,missing-class-docstring,missing-function-docstring,too-few-public-methods

from typing import Protocol
from unittest.mock import MagicMock, patch

import httpx
import pytest
from lxml import etree
from tests.support.fixture_types import FeedFactory

from feed_editor.rss.fetch import FeedError, fetch_feed
from feed_editor.rss.models import FeedType


class ResponseFactory(Protocol):
    def __call__(self, status_code: int, text: str | None = None) -> httpx.Response: ...


@pytest.fixture
def response_factory() -> ResponseFactory:
    def factory(status_code, text=None):
        return httpx.Response(status_code=status_code, text=text)

    return factory


@pytest.mark.parametrize(
    "feed_type_name,feed_type",
    [
        pytest.param("rss", FeedType.RSS, id="rss"),
        pytest.param("atom", FeedType.ATOM, id="atom"),
    ],
)
@patch("httpx.get")
def test_rss_fetch__ok(
    get_mock: MagicMock,
    response_factory: ResponseFactory,
    feed_factory: FeedFactory,
    feed_type_name,
    feed_type,
):
    mock_url = "https://example.fake"
    feed = feed_factory(feed_type_name)
    feed_xml = feed.as_xml()

    response = response_factory(status_code=200, text=feed_xml)

    get_mock.return_value = response

    fetched_feed = fetch_feed(mock_url)

    get_mock.assert_called_once_with(mock_url, follow_redirects=True)
    assert fetched_feed.as_xml() == feed.as_xml()
    assert fetched_feed.feed_type == feed.feed_type == feed_type


@patch("httpx.get")
def test_rss_fetch__invalid_url(get_mock: MagicMock):
    mock_url = "this isnt a valid url"

    with pytest.raises(FeedError, match=r"valid url"):
        fetch_feed(mock_url)

    get_mock.assert_not_called()


@patch("httpx.get")
def test_rss_fetch__invalid_feed(
    get_mock: MagicMock, response_factory: ResponseFactory
):
    response = response_factory(
        status_code=200, text="Hey you got this as a response, it isnt a feed though"
    )

    get_mock.return_value = response

    with pytest.raises(FeedError, match=r"contain a valid feed") as exc_info:
        fetch_feed("https://example.fake")

    get_mock.assert_called_once()

    assert isinstance(exc_info.value.__cause__, etree.XMLSyntaxError)


@patch("httpx.get")
def test_rss_fetch__unknown_feed(
    get_mock: MagicMock, response_factory: ResponseFactory
):
    response = response_factory(
        status_code=200, text="<xml-but-mysterious></xml-but-mysterious>"
    )

    get_mock.return_value = response

    with pytest.raises(FeedError, match=r"root tag.+?xml-but-mysterious"):
        fetch_feed("https://example.fake")

    get_mock.assert_called_once()


@patch("httpx.get")
def test_rss_fetch__error_response(
    get_mock: MagicMock, response_factory: ResponseFactory
):
    get_mock.return_value = response_factory(status_code=500)

    with pytest.raises(FeedError, match=r"unavailable.+?\b500\b.+?"):
        fetch_feed("https://example.fake")

    get_mock.assert_called_once()
