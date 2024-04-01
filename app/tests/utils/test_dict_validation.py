# pylint: disable=redefined-outer-name

from typing import Mapping, NotRequired, TypedDict

import pydantic
import pytest
from feed_editor.utils.dict_validation import dict_validator, validate_dict


@pytest.fixture
def test_typed_dict_class():
    class TestTypedDict(TypedDict):
        a: str
        b: int
        c: NotRequired[str]

    return TestTypedDict


@pytest.mark.parametrize(
    "test_dict",
    [
        pytest.param({}, marks=pytest.mark.xfail),
        pytest.param({"a": "test", "b": 2}),
        pytest.param({"a": "test", "b": 2, "c": 3}, marks=pytest.mark.xfail),
        pytest.param({"a": "test", "b": 2, "c": "c"}),
    ],
)
def test_validate_dict(test_typed_dict_class, test_dict: Mapping):
    assert validate_dict(test_typed_dict_class, test_dict) == test_dict


@pytest.mark.parametrize(
    "test_dict,is_valid",
    [
        pytest.param({}, False),
        pytest.param({"a": "test", "b": 2}, True),
        pytest.param({"a": "test", "b": 2, "c": 3}, False),
        pytest.param({"a": "test", "b": 2, "c": "c"}, True),
    ],
)
def test_dict_validator(test_typed_dict_class, test_dict: Mapping, is_valid):
    validator = dict_validator(test_typed_dict_class)

    assert type(validator) is pydantic.TypeAdapter

    try:
        validator.validate_python(test_dict)
        assert is_valid
    except pydantic.ValidationError:
        assert not is_valid
