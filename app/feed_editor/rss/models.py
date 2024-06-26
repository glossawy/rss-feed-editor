import copy
import enum
from dataclasses import dataclass

from lxml import etree

from feed_editor.rss.errors import FeedError


class FeedType(enum.Enum):
    """Type of feed"""

    ATOM = enum.auto()
    RSS = enum.auto()


@dataclass
class Feed:
    """Basic representation of an Atom/RSS feed"""

    tree: etree._ElementTree
    feed_type: FeedType

    @classmethod
    def from_root(cls, root: etree._Element) -> "Feed":
        """Returns a Feed with a type derived from the given root element,
        this is primarily based on tag name
        """
        tag_name = root.tag.lower()

        if tag_name.endswith("rss"):
            feed_type = FeedType.RSS
        elif tag_name.endswith("feed"):
            feed_type = FeedType.ATOM
        else:
            raise FeedError(f"Unknown feed root tag: {tag_name}")

        return cls(etree.ElementTree(root), feed_type)

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
