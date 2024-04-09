import httpx
import validators  # type: ignore
from lxml import etree
from lxml.etree import _Element as Element

from feed_editor.rss.errors import FeedError
from feed_editor.rss.models import Feed


def _to_etree(feed_text: str) -> Element:
    return etree.fromstring(feed_text.encode("utf-8"), parser=etree.XMLParser())


def fetch_feed(rss_feed_url: str) -> Feed:
    """
    Requests an atom or rss feed from the given URL and attempts to parse
    it into a Feed. If the url is not an RSS feed it will error.

    Args:
        rss_feed_url (str): URL to an Atom or RSS feed

    Raises:
        FeedError: If not a valid url
        FeedError: If response is non-successful
        FeedError: Root tag is not RSS or Atom

    Returns:
        Feed: Basic wrapper around the etree representing the feed
    """
    if not validators.url(rss_feed_url):
        raise FeedError(f"Feed URL is not a valid URL, for {rss_feed_url}")

    resp = httpx.get(rss_feed_url, follow_redirects=True)

    if not resp.is_success:
        raise FeedError(
            f"Feed unavailable, returned {resp.status_code} response, for {rss_feed_url}"
        )

    try:
        root = _to_etree(resp.text)
        return Feed.from_root(root)
    except etree.XMLSyntaxError as exc:
        raise FeedError(
            f"Response from {rss_feed_url} does not contain a valid feed"
        ) from exc
