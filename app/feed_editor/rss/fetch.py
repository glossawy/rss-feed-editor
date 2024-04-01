import httpx
import validators  # type: ignore
from lxml import etree

from .models import Feed


class FeedError(RuntimeError):  # pylint: disable=missing-class-docstring
    pass


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

    parser = etree.XMLParser()
    root = etree.fromstring(resp.text.encode("utf-8"), parser)

    return Feed.from_root(root)
