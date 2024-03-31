# flake8: noqa
# pylint: skip-file

from typing_extensions import TypedDict

from .conditions import ConditionArgs
from .mutations import MutationArgs


class SingleConditionWithoutXPath(TypedDict):
    name: str
    args: ConditionArgs


class SingleConditionWithXPath(SingleConditionWithoutXPath):
    xpath: str


SingleCondition = SingleConditionWithXPath | SingleConditionWithoutXPath


class AndDict(TypedDict):
    all_of: list["ConditionDict"]


class OrDict(TypedDict):
    any_of: list["ConditionDict"]


ConditionDict = AndDict | OrDict | SingleCondition


class MutationDictWithoutXPath(TypedDict):
    name: str
    args: MutationArgs


class MutationDictWithXPath(MutationDictWithoutXPath):
    xpath: str


MutationDict = MutationDictWithXPath | MutationDictWithoutXPath


class RuleDict(TypedDict):
    condition: ConditionDict
    mutations: list[MutationDict]
    xpath: str


class FeedRulesDict(TypedDict):
    feed_url: str
    rules: list[RuleDict]
