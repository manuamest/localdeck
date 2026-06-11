def parse_scan_ports(value: str) -> list[int]:
    ports: list[int] = []
    seen: set[int] = set()

    for raw_part in value.split(","):
        part = raw_part.strip()
        if not part:
            continue

        port = int(part)
        if port < 1 or port > 65535:
            raise ValueError(f"Port out of range: {port}")

        if port not in seen:
            seen.add(port)
            ports.append(port)

    return ports
