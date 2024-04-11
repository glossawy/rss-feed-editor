# pylint: disable=too-few-public-methods,missing-class-docstring
import re
from typing import (
    TYPE_CHECKING,
    Generic,
    Optional,
    Protocol,
    TypedDict,
    TypeVar,
)

if TYPE_CHECKING:
    from .types import ConditionDict


class ContainsArgs(TypedDict):
    pattern: str


ConditionArgs = ContainsArgs
ConditionArgsT = TypeVar("ConditionArgsT", bound=ConditionArgs)


class Condition(Protocol, Generic[ConditionArgsT]):
    ArgSpec: type[ConditionArgsT]
    name: str

    def __call__(self, feed_value: str, args: ConditionArgsT) -> bool: ...

    def __test_factory__(
        self, xpath: str, args: Optional[ConditionArgsT] = None
    ) -> "ConditionDict": ...


class Contains(Condition[ContainsArgs]):
    ArgSpec = ContainsArgs
    name = "contains"

    def __call__(self, feed_value: str, args: ContainsArgs) -> bool:
        return re.search(args["pattern"], feed_value) is not None

    def __test_factory__(
        self, xpath: str, args: ContainsArgs | None = None
    ) -> "ConditionDict":
        args = args or {"pattern": ".+?"}
        return {"xpath": xpath, "name": self.name, "args": args}


all_conditions: list[Condition] = [condcls() for condcls in Condition.__subclasses__()]
conditions_map: dict[str, Condition] = {cond.name: cond for cond in all_conditions}
