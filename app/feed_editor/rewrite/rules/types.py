# flake8: noqa
# pylint: skip-file

from typing import Literal, NotRequired, TypedDict

from feed_editor.rewrite.rules.conditions import ConditionArgs
from feed_editor.rewrite.rules.mutations import MutationArgs


class SingleConditionDict(TypedDict):
    xpath: NotRequired[str]
    name: str
    args: "ConditionArgs"


class AndDict(TypedDict):
    all_of: list["ConditionDict"]


class OrDict(TypedDict):
    any_of: list["ConditionDict"]


ConditionDict = AndDict | OrDict | SingleConditionDict


class MutationDict(TypedDict):
    xpath: NotRequired[str]
    name: str
    args: "MutationArgs"


class RuleDict(TypedDict):
    rid: str
    name: str
    condition: ConditionDict
    mutations: list[MutationDict]
    xpath: str


class FeedTransformDict(TypedDict):
    version: Literal[1]
    feed_url: str
    rules: list[RuleDict]
