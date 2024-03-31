import base64
import gzip
import json
from typing import Mapping, Union, cast
from feed_editor.utils.dict_validation import validate_dict
from feed_editor.rewrite.rules.conditions import ConditionArgs
from feed_editor.rewrite.rules.mutations import MutationArgs
from feed_editor.rewrite.rules.types import (
    FeedRulesDict,
    ConditionDict,
    MutationDict,
    MutationDictWithoutXPath,
    RuleDict,
    SingleCondition,
    SingleConditionWithoutXPath,
)

# Each key in the feed dict must have a unique mapping here
# otherwise it wont be minified. If there is a collision then
# decoding will return invalid results.
KEY_MINIFY_MAP = {
    "feed_url": "f",
    "rules": "q",
    "condition": "d",
    "mutations": "m",
    # shared
    "xpath": "x",
    "name": "n",
    "args": "b",
    # Conditions
    "contains": "c",
    "all_of": "a",
    "any_of": "o",
    # Mutations
    "remove": "r",
    "replace": "s",
    "changeTag": "t",
    # contains
    "value": "v",
    # replace
    "pattern": "p",
    "replacement": "u",
    "trim": "y",
    # changeTag
    "tag": "w",
}

KEY_EXPAND_MAP = {v: k for k, v in KEY_MINIFY_MAP.items()}


def compress_and_encode(rules: FeedRulesDict) -> str:
    """
    Takes a feed url and its transforms, minifies the dict, compresses it
    and urlsafe b64 encodes it
    """
    simplified = _simplify_feed_dict(rules)
    jsonified = _json_dumps(simplified)
    gzipped = gzip.compress(jsonified.encode("utf-8"))
    encoded = base64.urlsafe_b64encode(gzipped).decode("utf-8")

    return encoded


def decode_and_decompress(encoded: str) -> FeedRulesDict:
    """
    Takes a minified version of the feed rules dict and decodes it, decompresses it,
    and un-minifies it.

    A lot of assumptions are made in this process, there is a last step of TypedDict
    validation that should fail if any of the assumptions were wrong.
    """
    decoded = base64.urlsafe_b64decode(encoded.encode("utf-8"))
    unzipped = gzip.decompress(decoded).decode("utf-8")
    simplified = json.loads(unzipped)

    return _feedify_simple_dict(simplified)


def _json_dumps(data: Mapping) -> str:
    return json.dumps(data, separators=(",", ":"), indent=None)


def _simplify_feed_dict(rules: FeedRulesDict) -> dict:
    def simplify_dict(args: Mapping) -> dict:
        return {KEY_MINIFY_MAP[k]: v for k, v in args.items()}

    def simplify_typed_dict(typed: Union[MutationDict, SingleCondition]) -> dict:
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
            KEY_MINIFY_MAP["xpath"]: rule["xpath"],
            KEY_MINIFY_MAP["condition"]: simplify_condition(rule["condition"]),
            KEY_MINIFY_MAP["mutations"]: [
                simplify_mutation(mut) for mut in rule["mutations"]
            ],
        }

    return {
        KEY_MINIFY_MAP["feed_url"]: rules["feed_url"],
        KEY_MINIFY_MAP["rules"]: [simplify_rule(rule) for rule in rules["rules"]],
    }


def _feedify_simple_dict(simple_dict: dict) -> FeedRulesDict:
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
        cond_dict: SingleConditionWithoutXPath = {
            "name": simple_condition[KEY_MINIFY_MAP["name"]],
            "args": feedify_condition_args_dict(
                simple_condition[KEY_MINIFY_MAP["args"]]
            ),
        }

        if KEY_MINIFY_MAP["xpath"] in simple_condition:
            return {**cond_dict, "xpath": simple_condition[KEY_MINIFY_MAP["xpath"]]}

        return cond_dict

    def feedify_mutation(simple_mutation: dict) -> MutationDict:
        mut_dict: MutationDictWithoutXPath = {
            "name": simple_mutation[KEY_MINIFY_MAP["name"]],
            "args": feedify_mutation_args_dict(simple_mutation[KEY_MINIFY_MAP["args"]]),
        }

        if KEY_MINIFY_MAP["xpath"] in simple_mutation:
            return {**mut_dict, "xpath": simple_mutation[KEY_MINIFY_MAP["xpath"]]}

        return mut_dict

    def feedify_rule(simple_rule: dict) -> RuleDict:
        return {
            "xpath": simple_rule[KEY_MINIFY_MAP["xpath"]],
            "condition": feedify_condition(simple_rule[KEY_MINIFY_MAP["condition"]]),
            "mutations": [
                feedify_mutation(mut)
                for mut in simple_rule[KEY_MINIFY_MAP["mutations"]]
            ],
        }

    return validate_dict(
        FeedRulesDict,
        {
            "feed_url": simple_dict[KEY_MINIFY_MAP["feed_url"]],
            "rules": [
                feedify_rule(rule) for rule in simple_dict[KEY_MINIFY_MAP["rules"]]
            ],
        },
    )
