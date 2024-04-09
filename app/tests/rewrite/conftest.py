import functools
import random
from typing import Literal, cast
from feed_editor.rewrite.rules.types import (
    ConditionDict,
    FeedRulesDict,
    MutationDict,
    RuleDict,
)
import pytest

from tests.support.fixture_types import (
    ConditionAggregates,
    ConditionContainsFactory,
    FeedRulesFactory,
    MutationRemoveFactory,
    MutationReplaceFactory,
    RuleFactory,
)


@pytest.fixture
def aggregate_conditions(
    contains_factory: ConditionContainsFactory,
) -> ConditionAggregates:
    def factory(
        type: Literal["all_of"] | Literal["any_of"],
        conditions: int | list[ConditionDict] = 1,
    ) -> ConditionDict:
        if isinstance(conditions, int):
            conditions = [contains_factory() for _ in range(conditions)]

        return cast(ConditionDict, {type: conditions})

    factory.all_of = functools.partial(factory, "all_of")
    factory.any_of = functools.partial(factory, "any_of")

    return cast(ConditionAggregates, factory)


@pytest.fixture
def contains_factory() -> ConditionContainsFactory:
    def factory(xpath=None, contains=None) -> ConditionDict:
        return {
            "xpath": xpath or "webMaster",
            "name": "contains",
            "args": {"value": contains or "Test"},
        }

    return factory


@pytest.fixture
def remove_factory() -> MutationRemoveFactory:
    def factory(xpath=None) -> MutationDict:
        return {
            "xpath": xpath or "webMaster",
            "name": "remove",
            "args": {},
        }

    return factory


@pytest.fixture
def replace_factory() -> MutationReplaceFactory:
    def factory(xpath=None, pattern=None, replacement=None, trim=False) -> MutationDict:
        return {
            "xpath": xpath or "webMaster",
            "name": "replace",
            "args": {
                "pattern": pattern or r".+?",
                "replacement": replacement or "test replacement",
                "trim": trim,
            },
        }

    return factory


@pytest.fixture
def rule_factory(
    contains_factory: ConditionContainsFactory,
    remove_factory: MutationRemoveFactory,
    replace_factory: MutationReplaceFactory,
) -> RuleFactory:
    def factory(
        xpath=None, condition=None, mutations: int | list[MutationDict] = 1
    ) -> RuleDict:
        if isinstance(mutations, int):
            mutations = [
                remove_factory() if random.random() < 0.5 else replace_factory()
                for _ in range(mutations)
            ]

        return {
            "xpath": xpath or "//channel/item",
            "condition": condition or contains_factory(),
            "mutations": mutations,
        }

    return factory


@pytest.fixture
def feed_rules_factory(rule_factory: RuleFactory) -> FeedRulesFactory:
    def factory(feed_url, rules: int | list[RuleDict] = 1) -> FeedRulesDict:
        if isinstance(rules, int):
            rules = [rule_factory() for _ in range(rules)]

        return {"feed_url": feed_url, "rules": rules}

    return factory
