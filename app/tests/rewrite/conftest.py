# pylint: disable=redefined-outer-name,protected-access,missing-function-docstring
import random
import uuid
from typing import Literal, cast

import pytest
from tests.support.fixture_types import (
    ConditionFactories,
    FeedTransformFactory,
    MutationFactories,
    RuleFactory,
)

from feed_editor.rewrite.rules.types import (
    AndDict,
    ConditionDict,
    FeedTransformDict,
    MutationDict,
    OrDict,
    RuleDict,
    SingleConditionDict,
)


class _ConditionFactories(ConditionFactories):
    def _aggregate_condition(
        self,
        aggregate_type: Literal["all_of"] | Literal["any_of"],
        conditions: int | list[ConditionDict] = 1,
    ) -> AndDict | OrDict:
        if isinstance(conditions, int):
            conditions = [self._contains_factory() for _ in range(conditions)]

        if aggregate_type == "all_of":
            return {"all_of": conditions}
        return {"any_of": conditions}

    def all_of(self, conditions: int | list[ConditionDict] = 1) -> AndDict:
        return cast(AndDict, self._aggregate_condition("all_of", conditions))

    def any_of(self, conditions: int | list[ConditionDict] = 1) -> OrDict:
        return cast(OrDict, self._aggregate_condition("any_of", conditions))

    def _contains_factory(self, xpath=None, contains=None) -> SingleConditionDict:
        return {
            "xpath": xpath or "webMaster",
            "name": "contains",
            "args": {"pattern": contains or "Test"},
        }

    def contains(
        self, xpath: str | None = None, contains: str | None = None
    ) -> SingleConditionDict:
        return self._contains_factory(xpath, contains)


class _MutationFactories(MutationFactories):
    def remove(self, xpath: str | None = None) -> MutationDict:
        return {"xpath": xpath or "webMaster", "name": "remove", "args": {}}

    def replace(
        self, xpath=None, pattern=None, replacement=None, trim=False
    ) -> MutationDict:
        return {
            "xpath": xpath or "webMaster",
            "name": "replace",
            "args": {
                "pattern": pattern or r".+?",
                "replacement": replacement or "test replacement",
                "trim": trim,
            },
        }


@pytest.fixture
def condition_factories() -> ConditionFactories:
    return _ConditionFactories()


@pytest.fixture
def mutation_factories() -> MutationFactories:
    return _MutationFactories()


@pytest.fixture
def rule_factory(
    condition_factories: ConditionFactories, mutation_factories: MutationFactories
) -> RuleFactory:
    def factory(
        xpath=None, condition=None, mutations: int | list[MutationDict] = 1
    ) -> RuleDict:
        if isinstance(mutations, int):
            mutations = [
                (
                    mutation_factories.remove()
                    if random.random() < 0.5
                    else mutation_factories.replace()
                )
                for _ in range(mutations)
            ]
        rule_id = uuid.uuid4().hex
        return {
            "rid": rule_id,
            "name": f"Rule #{rule_id}",
            "xpath": xpath or "//channel/item",
            "condition": condition or condition_factories.contains(),
            "mutations": mutations,
        }

    return factory


@pytest.fixture
def feed_transform_factory(rule_factory: RuleFactory) -> FeedTransformFactory:
    def factory(feed_url, rules: int | list[RuleDict] = 1) -> FeedTransformDict:
        if isinstance(rules, int):
            rules = [rule_factory() for _ in range(rules)]

        return {"version": 1, "feed_url": feed_url, "rules": rules}

    return factory
