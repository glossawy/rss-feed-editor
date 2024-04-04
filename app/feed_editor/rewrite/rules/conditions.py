import functools
from typing import Protocol, Callable, TypedDict, TYPE_CHECKING

from feed_editor.utils.dict_validation import _TypedDict_T, validate_dict

if TYPE_CHECKING:
    from .types import ConditionDict


def _require_args(dict_type: type[_TypedDict_T]):
    def decorator(
        predicate: Callable[[str, _TypedDict_T], bool]
    ) -> Callable[[str, "ConditionArgs"], bool]:
        @functools.wraps(predicate)
        def decorated(value, args: "ConditionArgs"):
            return predicate(value, validate_dict(dict_type, args))

        return decorated

    return decorator


class ContainsArgs(TypedDict):
    """Arguments to the contains condition"""

    value: str


@_require_args(ContainsArgs)
def _contains(feed_value: str, args: ContainsArgs, /) -> bool:
    return args["value"] in feed_value


def _contains_testval(xpath: str) -> "ConditionDict":
    return {"xpath": xpath, "name": "contains", "args": {"value": "test value"}}


ConditionArgs = ContainsArgs


class ConditionFn(Protocol):  # pylint: disable=too-few-public-methods
    """Required signature for a condition"""

    @staticmethod
    def __call__(value: str, args: ConditionArgs, /) -> bool: ...


class TestFactory(Protocol):
    def __call__(self, xpath: str) -> "ConditionDict": ...


class Condition(TypedDict):
    """Base TypedDict for a Condition"""

    display_name: str
    definition: ConditionFn
    arg_spec: type[ConditionArgs]
    test_factory: TestFactory


all_conditions: list[Condition] = [
    {
        "display_name": "contains",
        "definition": _contains,
        "arg_spec": ContainsArgs,
        "test_factory": _contains_testval,
    }
]

conditions_map: dict[str, Condition] = {
    cond["display_name"]: cond for cond in all_conditions
}
