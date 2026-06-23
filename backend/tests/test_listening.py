from pathlib import Path

from app.scanner.listening import discover_listening_ports

# 0x1F90 = 8080, 0x1F91 = 8081 (LISTEN, state 0A); 0xC350 = 50000 in non-LISTEN.
_TCP = """  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode
   0: 00000000:1F90 00000000:0000 0A 00000000:00000000 00:00000000 00000000  1000        0 1
   1: 0100007F:1F91 00000000:0000 0A 00000000:00000000 00:00000000 00000000  1000        0 2
   2: 0100007F:C350 0100007F:1F90 01 00000000:00000000 00:00000000 00000000  1000        0 3
"""

# 0x1FBC = 8124, LISTEN over IPv6.
_TCP6 = """  sl  local_address                         remote_address                        st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode
   0: 00000000000000000000000000000000:1FBC 00000000000000000000000000000000:0000 0A 00000000:00000000 00:00000000 00000000  1000        0 4
"""


def _write_proc(tmp_path: Path, tcp: str, tcp6: str) -> str:
    net = tmp_path / "net"
    net.mkdir()
    (net / "tcp").write_text(tcp)
    (net / "tcp6").write_text(tcp6)
    return str(tmp_path)


def test_discover_returns_only_listening_ports_deduped_and_sorted(tmp_path: Path) -> None:
    proc_root = _write_proc(tmp_path, _TCP, _TCP6)

    assert discover_listening_ports(proc_root) == [8080, 8081, 8124]


def test_discover_ignores_missing_proc_files(tmp_path: Path) -> None:
    assert discover_listening_ports(str(tmp_path)) == []
