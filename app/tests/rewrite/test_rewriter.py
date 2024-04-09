# pylint: disable=missing-function-docstring

from unittest.mock import MagicMock, call, create_autospec, patch, sentinel

import pytest
from tests.support.fixture_types import (
    ConditionFactories,
    FeedFactory,
    FeedRulesFactory,
    RuleFactory,
)

from feed_editor.rewrite.rewriter import FeedRewriter
from feed_editor.rss.errors import FeedError
from feed_editor.rss.models import Feed


def test_feed_rewriter__is_valid_feed__valid(feed_rules_factory: FeedRulesFactory):
    rewriter = FeedRewriter(feed_rules_factory(feed_url="https://example.fake"))

    assert rewriter.is_valid_feed


def test_feed_rewriter__is_valid_feed__invalid_url(
    feed_rules_factory: FeedRulesFactory,
):
    rewriter = FeedRewriter(feed_rules_factory(feed_url="not-a-valid-url"))

    assert not rewriter.is_valid_feed


@patch("feed_editor.rewrite.rewriter.rss_fetch")
def test_feed_rewriter__feed(
    rss_fetch: MagicMock, feed_rules_factory: FeedRulesFactory
):
    feed_url = "https://example.fake"
    rewriter = FeedRewriter(feed_rules_factory(feed_url=feed_url))
    feed = MagicMock()

    rss_fetch.return_value = feed

    assert rewriter.feed is feed
    rss_fetch.assert_called_once_with(feed_url)


@patch("feed_editor.rewrite.rewriter.rss_fetch")
def test_feed_rewriter__feed__caching(
    rss_fetch: MagicMock, feed_rules_factory: FeedRulesFactory
):
    feed_url = "https://example.fake"
    rewriter = FeedRewriter(feed_rules_factory(feed_url=feed_url))
    feed = MagicMock()

    rss_fetch.return_value = feed

    assert rewriter.feed is rewriter.feed is feed
    rss_fetch.assert_called_once()


@patch("feed_editor.rewrite.rewriter.run_rule")
@patch("feed_editor.rewrite.rewriter.rss_fetch")
def test_feed_rewriter__rewritten_feed(
    rss_fetch: MagicMock,
    run_rule: MagicMock,
    feed_rules_factory: FeedRulesFactory,
    rule_factory: RuleFactory,
    condition_factories: ConditionFactories,
):
    feed_url = "https://example.fake"

    rule_1 = rule_factory(condition=condition_factories.contains(contains="rule1"))
    rule_2 = rule_factory(condition=condition_factories.contains(contains="rule2"))

    feed_rules_dict = feed_rules_factory(
        feed_url=feed_url,
        rules=[rule_1, rule_2],
    )
    rewriter = FeedRewriter(feed_rules_dict)

    mock_feed: MagicMock = create_autospec(Feed, instance=True)
    mock_feed.tree = sentinel.tree
    mock_feed.copy.return_value = mock_feed

    rss_fetch.return_value = mock_feed

    assert rewriter.rewritten_feed is mock_feed
    mock_feed.copy.assert_called_once()
    rss_fetch.assert_called_once_with(feed_url)
    run_rule.assert_has_calls(
        [call(sentinel.tree, rule_1), call(sentinel.tree, rule_2)]
    )


@pytest.mark.parametrize(
    "feed_fixture_name,mime_type",
    [("rss", "application/rss+xml"), ("atom", "application/atom+xml")],
)
@patch("feed_editor.rewrite.rewriter.rss_fetch")
def test_feed_rewriter__mime_type(
    rss_fetch: MagicMock,
    feed_factory: FeedFactory,
    feed_rules_factory: FeedRulesFactory,
    feed_fixture_name,
    mime_type,
):
    feed_url = "https://example.fake"
    rewriter = FeedRewriter(feed_rules_factory(feed_url=feed_url))

    feed = feed_factory(feed_fixture_name)
    rss_fetch.return_value = feed

    assert rewriter.mime_type == mime_type
    rss_fetch.assert_called_once_with(feed_url)


@patch("feed_editor.rewrite.rewriter.rss_fetch")
def test_feed_rewriter__mime_type__unknown_feed_type(
    rss_fetch: MagicMock, feed_rules_factory: FeedRulesFactory
):
    rewriter = FeedRewriter(feed_rules_factory(feed_url="https://example.fake"))

    mock_feed = create_autospec(Feed, instance=True)
    mock_feed.feed_type = "mysterious-feed"

    rss_fetch.return_value = mock_feed

    with pytest.raises(FeedError, match=r"mime type known.+?mysterious-feed"):
        rewriter.mime_type  # pylint: disable=pointless-statement
