import functools
import re

from typing import Protocol, Callable
from typing_extensions import TypedDict

from lxml import etree
from feed_editor.utils.dict_validation import validate_dict, _TypedDict_T


def _require_args(dict_type: type[_TypedDict_T]):
    def decorator(
        operation: Callable[[etree._Element, _TypedDict_T], None]
    ) -> Callable[[etree._Element, "MutationArgs"], None]:
        @functools.wraps(operation)
        def decorated(elem, args: "MutationArgs"):
            operation(elem, validate_dict(dict_type, args))

        return decorated

    return decorator


class RemoveArgs(TypedDict):
    """Args for the remove mutation"""


@_require_args(RemoveArgs)
def _remove(element: etree._Element, _args: RemoveArgs, /):
    parent = element.getparent()

    if parent is not None:
        parent.remove(element)


class ReplaceArgs(TypedDict):
    """Args for the replace mutation"""

    pattern: str
    replacement: str
    trim: bool


@_require_args(ReplaceArgs)
def _replace(element: etree._Element, args: ReplaceArgs, /):
    elem_text = element.text

    if elem_text is not None:
        elem_text = re.sub(
            args["pattern"], args["replacement"], elem_text, flags=re.DOTALL
        )
        if args["trim"]:
            elem_text = elem_text.strip()

    element.text = elem_text


class ChangeTagArgs(TypedDict):
    """args for the change tag mutation"""

    tag: str


@_require_args(ChangeTagArgs)
def _change_tag(element: etree._Element, args: ChangeTagArgs, /):
    element.tag = args["tag"]


MutationArgs = ReplaceArgs | RemoveArgs | ChangeTagArgs


class MutationFn(Protocol):  # pylint: disable=too-few-public-methods
    """Required signature for mutations"""

    @staticmethod
    def __call__(element: etree._Element, args: MutationArgs, /) -> None: ...


class Mutation(TypedDict):
    """Base TypedDict for all mutations"""

    display_name: str
    definition: MutationFn
    arg_spec: type[MutationArgs]


mutation_list: list[Mutation] = [
    {"display_name": "remove", "definition": _remove, "arg_spec": RemoveArgs},
    {"display_name": "replace", "definition": _replace, "arg_spec": ReplaceArgs},
    {"display_name": "changeTag", "definition": _change_tag, "arg_spec": ChangeTagArgs},
]

mutation_map: dict[str, Mutation] = {mut["display_name"]: mut for mut in mutation_list}
