from tests.support.fixture_types import (
    ConditionFactories,
    FeedRulesFactory,
    RuleFactory,
)

from feed_editor.rewrite import compression
from feed_editor.rewrite.rules import conditions, mutations


def test_compression__identity(
    feed_rules_factory: FeedRulesFactory,
    rule_factory: RuleFactory,
    condition_factories: ConditionFactories,
):
    """
    This test runs all defined mutations and conditions through compression/decompression to
    verify we are unlikely to lose data.
    """

    conds = [
        condition["test_factory"]("xpath") for condition in conditions.all_conditions
    ]
    conds = [
        *conds,
        condition_factories.all_of(conds),
        condition_factories.any_of(conds),
    ]

    condition = condition_factories.all_of(conds)

    muts = [mutation["test_factory"]("xpath") for mutation in mutations.mutation_list]

    rules = [rule_factory(condition=condition, mutations=muts) for _ in range(3)]

    feed_rules = feed_rules_factory(feed_url="https://example.fake", rules=rules)

    assert (
        compression.decode_and_decompress(compression.compress_and_encode(feed_rules))
        == feed_rules
    )
