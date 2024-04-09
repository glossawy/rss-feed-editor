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
        pytest.param({}, marks=pytest.mark.xfail, id="empty-dict"),
        pytest.param({"a": "test", "b": 2}, id="field-not-required"),
        pytest.param(
            {"a": "test", "b": 2, "c": 3}, marks=pytest.mark.xfail, id="invalid-type"
        ),
        pytest.param({"a": "test", "b": 2, "c": "c"}, id="valid"),
    ],
)
def test_validate_dict(test_typed_dict_class, test_dict: Mapping):
    assert validate_dict(test_typed_dict_class, test_dict) == test_dict


@pytest.mark.parametrize(
    "test_dict,is_valid",
    [
        pytest.param({}, False, id="invalid-empty-dict"),
        pytest.param({"a": "test", "b": 2}, True, id="valid-field-not-required"),
        pytest.param({"a": "test", "b": 2, "c": 3}, False, id="invalid-type"),
        pytest.param({"a": "test", "b": 2, "c": "c"}, True, id="valid"),
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
