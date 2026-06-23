import os

AUTO_TOKEN = "auto"

# Hex value of the TCP_LISTEN state in /proc/net/tcp.
_LISTEN_STATE = "0A"
_PROC_NET_FILES = ("net/tcp", "net/tcp6")


def discover_listening_ports(proc_root: str = "/proc") -> list[int]:
    """Return the TCP ports in LISTEN state, read from /proc/net/tcp[6].

    Only meaningful when the process shares the host network namespace
    (Docker ``network_mode: host``); otherwise it reports the container's
    own sockets.
    """
    ports: set[int] = set()

    for name in _PROC_NET_FILES:
        path = os.path.join(proc_root, name)
        try:
            with open(path) as handle:
                lines = handle.readlines()
        except OSError:
            continue

        for line in lines[1:]:
            fields = line.split()
            if len(fields) < 4 or fields[3] != _LISTEN_STATE:
                continue

            _, _, port_hex = fields[1].rpartition(":")
            try:
                port = int(port_hex, 16)
            except ValueError:
                continue

            if 1 <= port <= 65535:
                ports.add(port)

    return sorted(ports)
