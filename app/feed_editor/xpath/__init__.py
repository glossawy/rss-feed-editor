import functools
from typing import Concatenate, Callable, TypeVar, ParamSpec, Mapping, cast

from lxml import etree


_P = ParamSpec("_P")
_Result_T = TypeVar("_Result_T")
_NamespaceMap = Mapping[str, str]
_ElementOrTree = etree._Element | etree._ElementTree
NamespaceAwareFn = Callable[Concatenate[_ElementOrTree, _NamespaceMap, ...], _Result_T]
NamespaceUnawareFn = Callable[Concatenate[_ElementOrTree, ...], _Result_T]


def _normalize_tree_input(
    ns_aware_fn: Callable[Concatenate[_ElementOrTree, _NamespaceMap, _P], _Result_T]
) -> Callable[Concatenate[_ElementOrTree, _P], _Result_T]:
    @functools.wraps(ns_aware_fn)
    def unaware(root: _ElementOrTree, *args: _P.args, **kwargs: _P.kwargs):
        if isinstance(root, etree._Element):
            nsmap = root.nsmap
        else:
            nsmap = root.getroot().nsmap

        # This is just to satisfy lxml-stubs
        #
        # _Element.nsmap is dict[str | None, str] but lxml wants namespaces
        # to be Mapping[str, str] despite None keys being acceptable. This just
        # satisfies the type checker
        nsmap = cast(_NamespaceMap, nsmap)

        return ns_aware_fn(root, nsmap, *args, **kwargs)

    return unaware


@_normalize_tree_input
def ns_aware_find(
    root: _ElementOrTree, nsmap: _NamespaceMap, xpath: str
) -> etree._Element | None:
    return root.find(xpath, namespaces=nsmap)


@_normalize_tree_input
def ns_aware_findall(
    root: _ElementOrTree, nsmap: _NamespaceMap, xpath: str
) -> list[etree._Element]:
    return root.findall(xpath, namespaces=nsmap)
