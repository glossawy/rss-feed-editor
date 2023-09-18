def munge_xml_namespace(xml_string: str) -> str:
    # Just to make lxml play nice
    return xml_string.replace(" xmlns", " xmlnamespace", 1)


def demunge_xml_namespace(xml_string: str) -> str:
    # Restore sanity to the world, undo our madness
    return xml_string.replace(" xmlnamespace", " xmlns", 1)
