import httpx
import validators
from lxml import etree

from .models import Feed, FeedType


class FeedError(RuntimeError):
    pass


def fetch_feed(rss_feed_url: str) -> Feed:
    if not validators.url(rss_feed_url):
        raise FeedError(f"Feed URL is not a valid URL, for {rss_feed_url}")

    resp = httpx.get(rss_feed_url, follow_redirects=True)

    if not resp.is_success:
        raise FeedError(
            f"Feed unavailable, returned {resp.status_code} response, for {rss_feed_url}"
        )

    parser = etree.XMLParser()
    root = etree.fromstring(resp.text.encode("utf-8"), parser)

    tag: str = root.tag

    if "atom" in tag.lower() or "feed" in tag.lower():
        feed_type = FeedType.ATOM
    elif "rss" in tag.lower():
        feed_type = FeedType.RSS
    else:
        raise FeedError(f"Unknown feed type for tag: {tag}")

    return Feed(etree.ElementTree(root), feed_type)
