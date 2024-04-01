from typing import Callable
from feed_editor.utils.xpath import ns_aware_find, ns_aware_findall

from lxml.etree import _ElementTree as ElementTree


def test_ns_aware_find(feed_tree_factory: Callable[[str], ElementTree]):
    rss_tree = feed_tree_factory("atom")

    nsmap = rss_tree.getroot().nsmap

    ns_naive_element = rss_tree.find("//entry")
    ns_aware_element = ns_aware_find(rss_tree, "//entry")

    assert len(nsmap) > 0
    assert ns_naive_element is None
    assert ns_aware_element is not None
    assert ns_aware_element.nsmap == nsmap


def test_ns_aware_findall(feed_tree_factory: Callable[[str], ElementTree]):
    atom_tree = feed_tree_factory("atom")

    nsmap = atom_tree.getroot().nsmap

    ns_naive_elements = atom_tree.findall("//entry")
    ns_aware_elements = ns_aware_findall(atom_tree, "//entry")

    assert len(nsmap) > 0
    assert len(ns_naive_elements) == 0
    assert len(ns_aware_elements) > 0
    assert all(elem.nsmap == nsmap for elem in ns_aware_elements)
