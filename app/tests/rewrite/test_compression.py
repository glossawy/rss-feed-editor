from feed_editor.rewrite import compression

from feed_editor.rewrite.rules import mutations, conditions
from tests.support.fixture_types import (
    FeedRulesFactory,
    RuleFactory,
    ConditionAggregates,
)


def test_compression__identity(
    feed_rules_factory: FeedRulesFactory,
    rule_factory: RuleFactory,
    aggregate_conditions: ConditionAggregates,
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
        aggregate_conditions.all_of(conds),
        aggregate_conditions.any_of(conds),
    ]

    condition = aggregate_conditions.all_of(conds)

    muts = [mutation["test_factory"]("xpath") for mutation in mutations.mutation_list]

    rules = [rule_factory(condition=condition, mutations=muts) for _ in range(3)]

    feed_rules = feed_rules_factory(feed_url="https://example.fake", rules=rules)

    assert (
        compression.decode_and_decompress(compression.compress_and_encode(feed_rules))
        == feed_rules
    )
