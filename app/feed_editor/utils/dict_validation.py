from typing import TypeVar
from typing_extensions import TypedDict

from pydantic.type_adapter import TypeAdapter


_TypedDict_T = TypeVar("_TypedDict_T", bound=TypedDict)


def dict_validator(dict_type: type[TypedDict]) -> TypeAdapter:
    return TypeAdapter(dict_type)


def validate_typed_dict(
    dict_type: type[_TypedDict_T], test_dict: TypedDict
) -> _TypedDict_T:
    return dict_validator(dict_type).validate_python(test_dict)


def validate_dict(dict_type: type[_TypedDict_T], test_dict: dict) -> _TypedDict_T:
    return dict_validator(dict_type).validate_python(test_dict)
