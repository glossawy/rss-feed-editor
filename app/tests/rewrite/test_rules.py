from typing import cast
from feed_editor.rewrite.rules import (
    validate_dict,
    validate_xpaths,
    test_conditions_element as match_conditions_element,
    run_mutations_element,
    run_rule,
    apply_rule,
)

from feed_editor.rewrite.rules.types import (
    MutationDictWithoutXPath,
    RuleDict,
    SingleConditionWithoutXPath,
)
import pydantic
import pytest
from lxml.etree import _Element as Element, _ElementTree as ElementTree
from tests.support.fixture_types import (
    FeedRulesFactory,
    ConditionFactories,
    MutationFactories,
)


@pytest.fixture
def rss_tree(feed_tree_factory) -> ElementTree:
    return feed_tree_factory("rss")


@pytest.fixture
def rss_item(rss_tree: ElementTree) -> Element:
    element = rss_tree.find("//channel/item")
    assert element is not None

    return element


def test_validate_dict__invalid_dict(feed_rules_factory: FeedRulesFactory):
    with pytest.raises(pydantic.ValidationError):
        validate_dict({"not": "correct"})


def test_validate_dict__valid(feed_rules_factory: FeedRulesFactory):
    validate_dict(feed_rules_factory(feed_url="example.fake", rules=3))


@pytest.mark.parametrize(
    "invalid_xpath_at", ["rules.0", "rules.0.condition", "rules.0.mutations.0"]
)
def test_validate_xpaths__invalid_xpath_at_rule(
    feed_rules_factory: FeedRulesFactory, invalid_xpath_at
):
    feed_rules = feed_rules_factory(feed_url="example.fake")

    tmp: dict = cast(dict, feed_rules)
    for path in invalid_xpath_at.split("."):
        try:
            tmp = tmp[int(path)]
        except ValueError:
            tmp = tmp[path]

    tmp["xpath"] = ""

    assert not validate_xpaths(feed_rules)


def test_validate_xpaths__valid(feed_rules_factory: FeedRulesFactory):
    assert validate_xpaths(feed_rules_factory(feed_url="example.fake"))


def test_test_conditions_element__single_condition(
    rss_item: Element, condition_factories: ConditionFactories
):
    condition = condition_factories.contains(xpath="title", contains="NASA")
    assert match_conditions_element(rss_item, condition)


def test_test_conditions_element__absolute_xpath(
    rss_item: Element, condition_factories: ConditionFactories
):
    condition = condition_factories.contains(
        xpath="//channel/webMaster", contains="Sally"
    )
    assert match_conditions_element(rss_item, condition)


def test_test_conditions_element__implied_xpath(
    rss_item: Element, condition_factories: ConditionFactories
):
    title_element = rss_item.find("title")
    assert title_element is not None

    condition_with_xpath = condition_factories.contains(contains="NASA")
    condition: SingleConditionWithoutXPath = {
        "name": condition_with_xpath["name"],
        "args": condition_with_xpath["args"],
    }

    assert match_conditions_element(title_element, condition)


@pytest.mark.parametrize(
    "possible_matches",
    [("NASA", "ROSCOM", "Louisiana"), ("Some", "Of", "these", "NASA", "wont", "match")],
)
def test_test_conditions_element__any_of(
    rss_item: Element, condition_factories: ConditionFactories, possible_matches
):
    condition = condition_factories.any_of(
        conditions=[
            condition_factories.contains(xpath="title", contains=value)
            for value in possible_matches
        ]
    )
    assert match_conditions_element(rss_item, condition)


def test_test_conditions_element__any_of__failures(
    rss_item: Element, condition_factories: ConditionFactories
):
    condition = condition_factories.any_of(
        conditions=[
            condition_factories.contains(xpath="title", contains=value)
            for value in ("Not", "Going", "To", "Match")
        ]
    )
    assert not match_conditions_element(rss_item, condition)


def test_test_conditions_element__all_of(
    rss_item: Element, condition_factories: ConditionFactories
):
    condition = condition_factories.all_of(
        conditions=[
            condition_factories.contains(xpath="title", contains=value)
            for value in ("NASA", "Space", "Station", "Louisiana")
        ]
    )
    assert match_conditions_element(rss_item, condition)


@pytest.mark.parametrize(
    "required_matches",
    [
        ("NASA", "Space", "FailMatch"),
        ("None", "of", "these", "match"),
    ],
)
def test_test_conditions_element__all_of__failures(
    rss_item: Element, condition_factories: ConditionFactories, required_matches
):
    condition = condition_factories.all_of(
        conditions=[
            condition_factories.contains(xpath="title", contains=value)
            for value in required_matches
        ]
    )
    assert not match_conditions_element(rss_item, condition)


def test_test_conditions_element__deeply_nested(
    rss_item: Element, condition_factories: ConditionFactories
):
    condition = condition_factories.all_of(
        [
            condition_factories.any_of(
                [
                    condition_factories.all_of(
                        [
                            condition_factories.any_of(
                                [
                                    condition_factories.contains(
                                        xpath="title", contains="NASA"
                                    )
                                ]
                            ),
                            condition_factories.contains(
                                xpath="title", contains="Space Station"
                            ),
                        ]
                    )
                ]
            )
        ]
    )
    assert match_conditions_element(rss_item, condition)


def test_run_mutations_element(
    rss_item: Element, mutation_factories: MutationFactories
):
    assert rss_item.find("pubDate") is not None

    mutations = [
        mutation_factories.replace(
            xpath="//channel/webMaster", pattern="Sally", replacement="Salty"
        ),
        mutation_factories.remove(xpath="pubDate"),
    ]

    run_mutations_element(rss_item, mutations)

    webmaster = rss_item.getroottree().find("//channel/webMaster")
    pubdate = rss_item.find("pubDate")

    assert webmaster is not None
    assert webmaster.text == "sally.ride@example.com (Salty Ride)"
    assert pubdate is None


def test_run_mutations_element__implied_xpath(
    rss_item: Element, mutation_factories: MutationFactories
):
    title_element = rss_item.find("title")
    assert title_element is not None

    mutation_with_xpath = mutation_factories.remove()
    mutation: MutationDictWithoutXPath = {
        "name": mutation_with_xpath["name"],
        "args": mutation_with_xpath["args"],
    }

    run_mutations_element(title_element, mutations=[mutation])

    assert rss_item.find("title") is None


def test_run_rule(
    rss_tree: ElementTree,
    condition_factories: ConditionFactories,
    mutation_factories: MutationFactories,
):
    original_description_count = len(rss_tree.findall("//channel/item/description"))

    rule: RuleDict = {
        "xpath": "//channel/item",
        "condition": condition_factories.all_of(
            [condition_factories.contains(xpath="title", contains="NASA")]
        ),
        "mutations": [mutation_factories.remove(xpath="description")],
    }

    run_rule(rss_tree, rule)

    descriptions = rss_tree.findall("//channel/item/description")

    # One Item in the feed does not have a title at all, the others have titles containing
    # NASA
    assert len(descriptions) != original_description_count
    assert len(descriptions) == 1


def test_apply_rule(
    rss_tree: ElementTree,
    condition_factories: ConditionFactories,
    mutation_factories: MutationFactories,
):
    original_descriptions = [
        e.text for e in rss_tree.findall("//channel/item/description")
    ]

    rule: RuleDict = {
        "xpath": "//channel/item",
        "condition": condition_factories.all_of(
            [condition_factories.contains(xpath="title", contains="NASA")]
        ),
        "mutations": [mutation_factories.remove(xpath="description")],
    }

    result = apply_rule(rss_tree, rule)

    descriptions = [e.text for e in rss_tree.findall("//channel/item/description")]
    result_descriptions = [e.text for e in result.findall("//channel/item/description")]

    assert descriptions == original_descriptions
    assert result_descriptions != original_descriptions
    assert len(result_descriptions) == 1
    assert result_descriptions[0] in original_descriptions
