import functools
from typing import Concatenate, Callable, TypeVar, ParamSpec, Mapping, cast

from lxml import etree


_P = ParamSpec("_P")
_Result_T = TypeVar("_Result_T")  # pylint: disable=invalid-name
_NamespaceMap = Mapping[str, str]
_ElementOrTree = etree._Element | etree._ElementTree  # pylint: disable=protected-access


def _normalize_tree_input(
    ns_aware_fn: Callable[Concatenate[_ElementOrTree, _NamespaceMap, _P], _Result_T]
) -> Callable[Concatenate[_ElementOrTree, _P], _Result_T]:
    @functools.wraps(ns_aware_fn)
    def unaware(root: _ElementOrTree, *args: _P.args, **kwargs: _P.kwargs):
        if isinstance(root, etree._Element):  # pylint: disable=protected-access
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


def _ns_aware_find(
    root: _ElementOrTree, nsmap: _NamespaceMap, xpath: str
) -> etree._Element | None:
    """
    Finds an element in the given etree by xpath, preserving the namespace mapping.

    Args:
        root (_ElementOrTree): etree to find in
        xpath (str): xpath to node

    Returns:
        etree._Element | None: Either the node is found or it is not
    """
    return root.find(xpath, namespaces=nsmap)


def _ns_aware_findall(
    root: _ElementOrTree, nsmap: _NamespaceMap, xpath: str
) -> list[etree._Element]:
    """
    Finds all elements in the given etree that exist at the given xpath,
    preserving the namespace mappings.

    Args:
        root (_ElementOrTree): etree to find in
        xpath (str): xpath to node(s)

    Returns:
        list[etree._Element]: All found nodes for the given xpath
    """
    return root.findall(xpath, namespaces=nsmap)


ns_aware_find = _normalize_tree_input(_ns_aware_find)
ns_aware_findall = _normalize_tree_input(_ns_aware_findall)
