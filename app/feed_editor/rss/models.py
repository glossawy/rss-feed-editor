from dataclasses import dataclass

import copy
import enum

from lxml import etree


class FeedType(enum.Enum):
    """Type of feed"""

    ATOM = enum.auto()
    RSS = enum.auto()


@dataclass
class Feed:
    """Basic representation of an Atom/RSS feed"""

    tree: etree._ElementTree
    feed_type: FeedType

    def copy(self) -> "Feed":
        """Returns a copy of the feed with a structurally identical etree

        Returns:
            Feed: Copy of this feed
        """
        new_tree = copy.deepcopy(self.tree)
        return Feed(new_tree, self.feed_type)

    def as_xml(self) -> str:
        """Get the XML string representation of this feed

        Returns:
            str: XML string representation (utf-8)
        """
        return etree.tostring(self.tree, pretty_print=True).decode("utf-8")
