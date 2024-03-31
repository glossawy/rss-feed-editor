import copy
from typing import cast

from lxml import etree

from feed_editor.utils.dict_validation import validate_dict as generic_validate_dict
from feed_editor.xpath import ns_aware_find, ns_aware_findall

from .conditions import conditions_map
from .mutations import mutation_map
from .types import AndDict, ConditionDict, FeedRulesDict, MutationDict, OrDict, RuleDict


def validate_dict(test_dict: dict):
    """Validate that a dictionary represents a feed and rules to apply to it (FeedRulesDict)"""
    generic_validate_dict(FeedRulesDict, test_dict)
    return cast(FeedRulesDict, test_dict)


def validate_xpaths(feed_rules: FeedRulesDict) -> bool:
    """Traverses the entire dictionary and ensures that all rules and their
    mutations and conditions have valid xpaths, primarily that they are non-empty.

    Args:
        feed_rules (FeedRulesDict): Feed URL and transformation rules

    Returns:
        bool: True if all xpaths are valid, False otherwise
    """

    def is_valid_xpath(xpath: str) -> bool:
        return xpath.strip() != ""

    def validate_condition_paths(cond: ConditionDict) -> bool:
        if "xpath" in cond:
            return is_valid_xpath(cond["xpath"])
        if "all_of" in cond:
            return all(
                validate_condition_paths(sub_cond) for sub_cond in cond["all_of"]
            )
        if "any_of" in cond:
            return all(
                validate_condition_paths(sub_cond) for sub_cond in cond["any_of"]
            )

        return True

    def validate_rule_xpaths(rule: RuleDict) -> bool:
        return (
            is_valid_xpath(rule["xpath"])
            and validate_condition_paths(rule["condition"])
            and all(
                is_valid_xpath(mutation["xpath"]) if "xpath" in mutation else True
                for mutation in rule["mutations"]
            )
        )

    return all(validate_rule_xpaths(rule) for rule in feed_rules["rules"])


def test_conditions_element(
    element: etree._Element, root_condition: ConditionDict
) -> bool:
    """Tests that an individual element in the feed matches the condition in full

    Args:
        element (etree._Element): Element being tested
        root_condition (ConditionDict): Condition to test

    Returns:
        bool: True if element matches condition
    """

    def test_condition(condition: ConditionDict) -> bool:
        test_element = element

        if "xpath" in condition:
            test_element = _resolve_and_find(element, condition["xpath"])

        if test_element is None:
            return False

        if "all_of" in condition:
            return test_conjunction(condition)

        if "any_of" in condition:
            return test_disjunction(condition)

        if condition["name"] in conditions_map:
            cond_dict = conditions_map[condition["name"]]
            cond = cond_dict["definition"]

            if test_element is not None and test_element.text is not None:
                return cond(test_element.text, condition["args"])
            return False

        raise RuntimeError(f"No condition with name {condition['name']}")

    def test_conjunction(condition: AndDict) -> bool:
        return all(test_condition(cond) for cond in condition["all_of"])

    def test_disjunction(condition: OrDict) -> bool:
        return any(test_condition(cond) for cond in condition["any_of"])

    return test_condition(root_condition)


def run_mutations_element(
    element: etree._Element, mutations: list[MutationDict]
) -> None:
    """Run all given mutation on an individual element of a feed

    Args:
        element (etree._Element): Element of feed
        mutations (list[MutationDict]): Sequence of mutations to perform in-place
    """
    for mutation_dict in mutations:
        if mutation_dict["name"] not in mutation_map:
            raise RuntimeError(f"Unknown mutation: {mutation_dict['name']}")

        if "xpath" in mutation_dict:
            target_element = _resolve_and_find(element, mutation_dict["xpath"])
        else:
            target_element = element

        if target_element is None:
            return

        mut = mutation_map[mutation_dict["name"]]
        args = mutation_dict["args"]

        mut["definition"](target_element, args)


def run_rule(tree: etree._ElementTree, rule: RuleDict) -> None:
    """Run the given rule against the given tree of feed elements.

    Any elements matching the xpath and the condition will have *all* mutations applied in-place.

    Args:
        tree (etree._ElementTree): Tree of feed elements
        rule (RuleDict): Rule to apply
    """

    # pylint: disable=no-value-for-parameter
    for element in ns_aware_findall(tree, rule["xpath"]):
        if test_conditions_element(element, rule["condition"]):
            run_mutations_element(element, rule["mutations"])


def apply_rule(tree: etree._ElementTree, rule: RuleDict) -> etree._ElementTree:
    """Runs the given rule against a copy of a tree of feed elements.

    Any elements in the copy matching the xpath and the condition will have
    *all* mutations applied in-place.

    The difference between this and run_rule is that this does not mutate
    the provided tree.

    Args:
        tree (etree._ElementTree): _description_
        rule (RuleDict): _description_

    Returns:
        etree._ElementTree: _description_
    """
    modifiable_tree = copy.deepcopy(tree)
    run_rule(modifiable_tree, rule)
    return modifiable_tree


def _resolve_and_find(root: etree._Element, xpath: str) -> etree._Element | None:
    # Handle xpaths that are absolute rather than relative
    if xpath.startswith("/"):
        context_node = root.getroottree()
    else:
        context_node = root

    # pylint: disable=no-value-for-parameter
    return ns_aware_find(context_node, xpath)
