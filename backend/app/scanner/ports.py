def parse_scan_ports(value: str) -> list[int]:
    ports: list[int] = []
    seen: set[int] = set()

    for raw_part in value.split(","):
        part = raw_part.strip()
        if not part:
            continue

        for port in _expand_port_part(part):
            if port not in seen:
                seen.add(port)
                ports.append(port)

    return ports


def _expand_port_part(part: str) -> list[int]:
    if "-" not in part:
        port = int(part)
        _validate_port(port)
        return [port]

    start_raw, end_raw = part.split("-", maxsplit=1)
    start = int(start_raw.strip())
    end = int(end_raw.strip())
    _validate_port(start)
    _validate_port(end)

    if start > end:
        raise ValueError(f"Invalid port range: {part}")

    return list(range(start, end + 1))


def _validate_port(port: int) -> None:
    if port < 1 or port > 65535:
        raise ValueError(f"Port out of range: {port}")
