from typing import Callable, Literal, Protocol

from feed_editor.rewrite.rules.types import (
    ConditionDict,
    FeedRulesDict,
    MutationDict,
    RuleDict,
)
from feed_editor.rss.models import Feed
from lxml.etree import _ElementTree as ElementTree


MutationFactory = Callable[..., MutationDict]
ConditionFactory = Callable[..., ConditionDict]


class FeedXmlLoader(Protocol):
    def __call__(self, feed_fixture_name: str) -> str: ...


class FeedTreeFactory(Protocol):
    def __call__(self, feed_fixture_name: str) -> ElementTree: ...


class FeedFactory(Protocol):
    def __call__(self, feed_fixture_name: str) -> Feed: ...


class ConditionContainsFactory(Protocol):
    def __call__(
        self, xpath: str | None = None, contains: str | None = None
    ) -> ConditionDict: ...


class ConditionAggregates(Protocol):
    def __call__(
        self,
        type: Literal["any_of"] | Literal["all_of"],
        conditions: int | list[ConditionDict] = 1,
    ): ...
    def all_of(self, conditions: int | list[ConditionDict] = 1): ...
    def any_of(self, conditions: int | list[ConditionDict] = 1): ...


class MutationRemoveFactory(Protocol):
    def __call__(self, xpath: str | None = None) -> MutationDict: ...


class MutationReplaceFactory(Protocol):
    def __call__(
        self,
        xpath: str | None = None,
        pattern: str | None = None,
        replacement: str | None = None,
        trim: bool = False,
    ) -> MutationDict: ...


class RuleFactory(Protocol):
    def __call__(
        self,
        xpath: str | None = None,
        condition: ConditionDict | None = None,
        mutations: int | list[MutationDict] = 1,
    ) -> RuleDict: ...


class FeedRulesFactory(Protocol):
    def __call__(
        self, feed_url: str, rules: int | list[RuleDict] = 1
    ) -> FeedRulesDict: ...
