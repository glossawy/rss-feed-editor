import dataclasses
from functools import cached_property
from typing import cast

import validators

from feed_editor.rewrite.rules.types import FeedRulesDict
from feed_editor.rewrite.rules import run_rule
from feed_editor.rss.fetch import Feed, fetch_feed as rss_fetch


@dataclasses.dataclass
class FeedRewriter:
    feed_rules: FeedRulesDict

    @property
    def is_valid_feed(self) -> bool:
        return cast(bool, validators.url(self.feed_url))

    @property
    def feed_url(self) -> str:
        return self.feed_rules["feed_url"]

    @cached_property
    def feed(self) -> Feed:
        return rss_fetch(self.feed_url)

    @property
    def rewritten_feed(self) -> Feed:
        new_feed = self.feed.copy()

        for rule_dict in self.feed_rules["rules"]:
            run_rule(new_feed.tree, rule_dict)

        return new_feed
