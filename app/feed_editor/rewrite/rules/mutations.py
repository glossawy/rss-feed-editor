# pylint: disable=too-few-public-methods,missing-class-docstring

import re
from typing import (
    TYPE_CHECKING,
    Generic,
    NotRequired,
    Optional,
    Protocol,
    TypeVar,
    TypedDict,
    cast,
)

from lxml import etree

if TYPE_CHECKING:
    from .types import MutationDict


class RemoveArgs(TypedDict):
    pass


class ReplaceArgs(TypedDict):
    pattern: str
    replacement: str
    trim: NotRequired[bool]


class ChangeTagArgs(TypedDict):
    tag: str


# Order matters here!! Pydantic will coerce the dict to the one matched first,
# leave RemoveArgs at end, otherwise args will be removed for other mutations.
#
# This is a limitation of python typing... or at least how I typed things here.
MutationArgs = ReplaceArgs | ChangeTagArgs | RemoveArgs

MutationArgsT = TypeVar("MutationArgsT", bound=MutationArgs)


class Mutation(Protocol, Generic[MutationArgsT]):
    ArgSpec: type[MutationArgsT]
    name: str

    def __call__(self, element: etree._Element, args: MutationArgsT): ...

    def __test_factory__(
        self, xpath: str, args: Optional[MutationArgsT] = None
    ) -> "MutationDict": ...


class Remove(Mutation[RemoveArgs]):
    ArgSpec = RemoveArgs
    name = "remove"

    def __call__(self, element: etree._Element, args: RemoveArgs):
        parent = element.getparent()

        if parent is not None:
            parent.remove(element)

    def __test_factory__(
        self, xpath: str, args: RemoveArgs | None = None
    ) -> "MutationDict":
        args = args or {}

        return {"xpath": xpath, "name": self.name, "args": args}


class Replace(Mutation[ReplaceArgs]):
    ArgSpec = ReplaceArgs
    name = "replace"

    def __call__(self, element: etree._Element, args: ReplaceArgs):
        elem_text = element.text

        if elem_text is not None:
            elem_text = re.sub(
                args["pattern"], args["replacement"], elem_text, flags=re.DOTALL
            )
            if args.get("trim", False):
                elem_text = elem_text.strip()

        element.text = elem_text

    def __test_factory__(
        self, xpath: str, args: ReplaceArgs | None = None
    ) -> "MutationDict":
        args = args or {"pattern": ".+?", "replacement": "test"}

        return {"xpath": xpath, "name": self.name, "args": args}


class ChangeTag(Mutation[ChangeTagArgs]):
    ArgSpec = ChangeTagArgs
    name = "changeTag"

    def __call__(self, element: etree._Element, args: ChangeTagArgs):
        element.tag = args["tag"]

    def __test_factory__(
        self, xpath: str, args: ChangeTagArgs | None = None
    ) -> "MutationDict":
        args = args or {"tag": "test"}
        return {"xpath": xpath, "name": self.name, "args": args}


all_mutations: list[Mutation] = [
    cast(type[Mutation], mutcls)() for mutcls in Mutation.__subclasses__()
]
mutation_map: dict[str, Mutation] = {mut.name: mut for mut in all_mutations}
