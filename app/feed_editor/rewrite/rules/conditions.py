import functools
from typing import Protocol, Callable
from typing_extensions import TypedDict

from feed_editor.utils.dict_validation import _TypedDict_T, validate_typed_dict


def _require_args(dict_type: type[_TypedDict_T]):
    def decorator(
        predicate: Callable[[str, _TypedDict_T], bool]
    ) -> Callable[[str, "ConditionArgs"], bool]:
        @functools.wraps(predicate)
        def decorated(value, args: "ConditionArgs"):
            return predicate(value, validate_typed_dict(dict_type, args))

        return decorated

    return decorator


class ContainsArgs(TypedDict):
    value: str


@_require_args(ContainsArgs)
def _contains(feed_value: str, args: ContainsArgs, /) -> bool:
    return args["value"] in feed_value


ConditionArgs = ContainsArgs


class ConditionFn(Protocol):
    @staticmethod
    def __call__(value: str, args: ConditionArgs, /) -> bool:
        ...


class Condition(TypedDict):
    display_name: str
    definition: ConditionFn
    arg_spec: type[ConditionArgs]


all_conditions: list[Condition] = [
    {"display_name": "contains", "definition": _contains, "arg_spec": ContainsArgs}
]

conditions_map: dict[str, Condition] = {
    cond["display_name"]: cond for cond in all_conditions
}
