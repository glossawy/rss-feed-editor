def normalize_xml(in_str: str):
    out_str = in_str.strip()
    out_str = out_str.replace("\r\n", "\n")
    out_str = out_str + "\n"

    return out_str
