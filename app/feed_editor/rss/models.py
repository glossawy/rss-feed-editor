from dataclasses import dataclass

import copy
import enum

from lxml import etree


class FeedType(enum.Enum):
    ATOM = enum.auto()
    RSS = enum.auto()


@dataclass
class Feed:
    tree: etree._ElementTree
    feed_type: FeedType

    def copy(self) -> "Feed":
        new_tree = copy.deepcopy(self.tree)
        return Feed(new_tree, self.feed_type)

    def as_xml(self) -> str:
        return etree.tostring(self.tree, pretty_print=True).decode("utf-8")
