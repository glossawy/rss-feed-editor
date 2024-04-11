import base64
import gzip
import json
from typing import Mapping, Union, cast

from feed_editor.rewrite.rules.conditions import ConditionArgs
from feed_editor.rewrite.rules.mutations import MutationArgs
from feed_editor.rewrite.rules.types import (
    ConditionDict,
    FeedTransformDict,
    MutationDict,
    RuleDict,
    SingleConditionDict,
)
from feed_editor.utils.dict_validation import validate_dict

# Each key in the feed dict must have a unique mapping here
# otherwise it wont be minified. If there is a collision then
# decoding will return invalid results.
# used:
# abcdefgmnoqrstuwyx
KEY_MINIFY_MAP = {
    "feed_url": "f",
    "rules": "q",
    "condition": "d",
    "mutations": "m",
    # shared
    "xpath": "x",
    "name": "n",
    "args": "b",
    # Feed Transform
    "version": "g",
    # Rules
    "rid": "e",
    # Conditions
    "contains": "c",
    "all_of": "a",
    "any_of": "o",
    # Mutations
    "remove": "r",
    "replace": "s",
    "changeTag": "t",
    # replace
    "pattern": "p",
    "replacement": "u",
    "trim": "y",
    # changeTag
    "tag": "w",
}

KEY_EXPAND_MAP = {v: k for k, v in KEY_MINIFY_MAP.items()}


def compress_and_encode(rules: FeedTransformDict) -> str:
    """
    Takes a feed url and its transforms, minifies the dict, compresses it
    and urlsafe b64 encodes it
    """
    return _gzip_encode(_simplify_feed_dict(rules))


def decode_and_decompress(encoded: str) -> FeedTransformDict:
    """
    Takes a minified version of the feed rules dict and decodes it, decompresses it,
    and un-minifies it.

    A lot of assumptions are made in this process, there is a last step of TypedDict
    validation that should fail if any of the assumptions were wrong.
    """
    return _feedify_simple_dict(_decode_ungzip(encoded))


def _gzip_encode(data: dict) -> str:
    jsonified = _json_dumps(data)
    gzipped = gzip.compress(jsonified.encode("utf-8"))
    encoded = base64.urlsafe_b64encode(gzipped).decode("utf-8")

    return encoded


def _decode_ungzip(data: str) -> dict:
    decoded = base64.urlsafe_b64decode(data.encode("utf-8"))
    unzipped = gzip.decompress(decoded).decode("utf-8")

    return json.loads(unzipped)


def _json_dumps(data: Mapping) -> str:
    return json.dumps(data, separators=(",", ":"), indent=None)


def _simplify_feed_dict(rules: FeedTransformDict) -> dict:
    def simplify_dict(args: Mapping) -> dict:
        return {KEY_MINIFY_MAP[k]: v for k, v in args.items()}

    def simplify_typed_dict(typed: Union[MutationDict, SingleConditionDict]) -> dict:
        simple_dict = {
            KEY_MINIFY_MAP["name"]: typed["name"],
            KEY_MINIFY_MAP["args"]: simplify_dict(typed["args"]),
        }

        if "xpath" in typed:
            simple_dict[KEY_MINIFY_MAP["xpath"]] = typed["xpath"]

        return simple_dict

    def simplify_condition(cond: ConditionDict) -> dict:
        if "all_of" in cond:
            return {
                KEY_MINIFY_MAP["all_of"]: [
                    simplify_condition(c) for c in cond["all_of"]
                ]
            }
        if "any_of" in cond:
            return {
                KEY_MINIFY_MAP["any_of"]: [
                    simplify_condition(c) for c in cond["any_of"]
                ]
            }
        return simplify_typed_dict(cond)

    def simplify_mutation(mut: MutationDict) -> dict:
        return simplify_typed_dict(mut)

    def simplify_rule(rule: RuleDict):
        return {
            KEY_MINIFY_MAP["rid"]: rule["rid"],
            KEY_MINIFY_MAP["name"]: rule["name"],
            KEY_MINIFY_MAP["xpath"]: rule["xpath"],
            KEY_MINIFY_MAP["condition"]: simplify_condition(rule["condition"]),
            KEY_MINIFY_MAP["mutations"]: [
                simplify_mutation(mut) for mut in rule["mutations"]
            ],
        }

    return {
        KEY_MINIFY_MAP["version"]: rules["version"],
        KEY_MINIFY_MAP["feed_url"]: rules["feed_url"],
        KEY_MINIFY_MAP["rules"]: [simplify_rule(rule) for rule in rules["rules"]],
    }


def _feedify_simple_dict(simple_dict: dict) -> FeedTransformDict:
    def feedify_condition_args_dict(simple_args: dict) -> ConditionArgs:
        return cast(
            ConditionArgs, {KEY_EXPAND_MAP[k]: v for k, v in simple_args.items()}
        )

    def feedify_mutation_args_dict(simple_args: dict) -> MutationArgs:
        return cast(
            MutationArgs, {KEY_EXPAND_MAP[k]: v for k, v in simple_args.items()}
        )

    def feedify_condition(simple_condition: dict) -> ConditionDict:
        if KEY_MINIFY_MAP["all_of"] in simple_condition:
            return {
                "all_of": [
                    feedify_condition(sc)
                    for sc in simple_condition[KEY_MINIFY_MAP["all_of"]]
                ]
            }
        if KEY_MINIFY_MAP["any_of"] in simple_condition:
            return {
                "any_of": [
                    feedify_condition(sc)
                    for sc in simple_condition[KEY_MINIFY_MAP["any_of"]]
                ]
            }
        cond_dict: SingleConditionDict = {
            "name": simple_condition[KEY_MINIFY_MAP["name"]],
            "args": feedify_condition_args_dict(
                simple_condition[KEY_MINIFY_MAP["args"]]
            ),
        }

        if KEY_MINIFY_MAP["xpath"] in simple_condition:
            cond_dict["xpath"] = simple_condition[KEY_MINIFY_MAP["xpath"]]

        return cond_dict

    def feedify_mutation(simple_mutation: dict) -> MutationDict:
        mut_dict: MutationDict = {
            "name": simple_mutation[KEY_MINIFY_MAP["name"]],
            "args": feedify_mutation_args_dict(simple_mutation[KEY_MINIFY_MAP["args"]]),
        }

        if KEY_MINIFY_MAP["xpath"] in simple_mutation:
            mut_dict["xpath"] = simple_mutation[KEY_MINIFY_MAP["xpath"]]

        return mut_dict

    def feedify_rule(simple_rule: dict) -> RuleDict:
        return {
            "rid": simple_rule[KEY_MINIFY_MAP["rid"]],
            "name": simple_rule[KEY_MINIFY_MAP["name"]],
            "xpath": simple_rule[KEY_MINIFY_MAP["xpath"]],
            "condition": feedify_condition(simple_rule[KEY_MINIFY_MAP["condition"]]),
            "mutations": [
                feedify_mutation(mut)
                for mut in simple_rule[KEY_MINIFY_MAP["mutations"]]
            ],
        }

    if (
        KEY_MINIFY_MAP["feed_url"] not in simple_dict
        or KEY_MINIFY_MAP["rules"] not in simple_dict
    ):
        return validate_dict(FeedTransformDict, simple_dict)

    return validate_dict(
        FeedTransformDict,
        {
            "version": simple_dict[KEY_MINIFY_MAP["version"]],
            "feed_url": simple_dict[KEY_MINIFY_MAP["feed_url"]],
            "rules": [
                feedify_rule(rule) for rule in simple_dict[KEY_MINIFY_MAP["rules"]]
            ],
        },
    )
