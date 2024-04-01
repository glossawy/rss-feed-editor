from typing import Mapping, TypeVar

from pydantic.type_adapter import TypeAdapter


_TypedDict_T = TypeVar("_TypedDict_T", bound=Mapping)  # pylint: disable=invalid-name


def dict_validator(dict_type: type[_TypedDict_T]) -> TypeAdapter:
    """Returns a Pydantic TypeAdapter for the provided TypedDict

    Args:
        dict_type (type[_TypedDict_T]): Should be a TypedDict

    Returns:
        TypeAdapter: Pydantic TypeAdapter to use for validating dicts
    """
    return TypeAdapter(dict_type)


def validate_dict(dict_type: type[_TypedDict_T], test_dict: Mapping) -> _TypedDict_T:
    """
    Validate that a test dictionary conforms to the specification given by
    dict_type

    Args:
        dict_type (type[_TypedDict_T]): TypedDict to test conformance to
        test_dict (Mapping): Typed or untyped dictionary to evaluate against dict_type

    Returns:
        _TypedDict_T: The test_dict but validated to be compatible with dict_type
    """
    return dict_validator(dict_type).validate_python(test_dict)
