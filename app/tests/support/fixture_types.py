# pylint: disable=missing-function-docstring,missing-class-docstring,too-few-public-methods
from typing import Any, Callable, Protocol

from lxml.etree import _ElementTree as ElementTree

from feed_editor.rewrite.rules.types import (
    AndDict,
    ConditionDict,
    FeedTransformDict,
    MutationDict,
    OrDict,
    RuleDict,
    SingleConditionDict,
)
from feed_editor.rss.models import Feed

MutationFactory = Callable[..., MutationDict]
ConditionFactory = Callable[..., ConditionDict]


class JsonLoader(Protocol):
    def __call__(self, fixture_name: str) -> dict[str, Any]: ...


class FeedXmlLoader(Protocol):
    def __call__(self, feed_fixture_name: str) -> str: ...


class FeedTreeFactory(Protocol):
    def __call__(self, feed_fixture_name: str) -> ElementTree: ...


class FeedFactory(Protocol):
    def __call__(self, feed_fixture_name: str) -> Feed: ...


class ConditionFactories(Protocol):
    def all_of(self, conditions: int | list[ConditionDict] = 1) -> AndDict: ...
    def any_of(self, conditions: int | list[ConditionDict] = 1) -> OrDict: ...

    def contains(
        self, xpath: str | None = None, contains: str | None = None
    ) -> SingleConditionDict: ...


class MutationFactories(Protocol):
    def remove(self, xpath: str | None = None) -> MutationDict: ...

    def replace(
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


class FeedTransformFactory(Protocol):
    def __call__(
        self, feed_url: str, rules: int | list[RuleDict] = 1
    ) -> FeedTransformDict: ...
