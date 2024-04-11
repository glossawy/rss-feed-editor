import dataclasses
from functools import cached_property
from typing import cast

import validators  # type: ignore

from feed_editor.rewrite.rules import run_rule
from feed_editor.rewrite.rules.types import FeedTransformDict
from feed_editor.rss.errors import FeedError
from feed_editor.rss.fetch import Feed
from feed_editor.rss.fetch import fetch_feed as rss_fetch
from feed_editor.rss.models import FeedType


@dataclasses.dataclass
class FeedRewriter:
    """
    Takes a feed url and rules to be applied to it and provides access
    to the rewritten feed
    """

    feed_transform: FeedTransformDict

    @property
    def is_valid_feed(self) -> bool:
        """Whether or not the feed is a valid feed (currently just a URL validator)"""
        return cast(bool, validators.url(self.feed_url))

    @property
    def feed_url(self) -> str:
        """Get the URL of the feed being rewritten"""
        return self.feed_transform["feed_url"]

    @cached_property
    def feed(self) -> Feed:
        """The original feed before any transformations"""
        return rss_fetch(self.feed_url)

    @property
    def rewritten_feed(self) -> Feed:
        """A rewritten version of the original feed after all rules are applied"""
        new_feed = self.feed.copy()

        for rule_dict in self.feed_transform["rules"]:
            run_rule(new_feed.tree, rule_dict)

        return new_feed

    @property
    def mime_type(self) -> str:
        """MIME type to use for the rewritten feed based on feed type"""
        match self.feed.feed_type:
            case FeedType.RSS:
                return "application/rss+xml"
            case FeedType.ATOM:
                return "application/atom+xml"
            case feed_type:
                raise FeedError(f"No mime type known for {feed_type} feed")
