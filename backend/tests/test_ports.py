import pytest

from app.scanner.ports import parse_scan_ports


def test_parse_scan_ports_returns_unique_ordered_ports() -> None:
    assert parse_scan_ports("3000, 5173,3000,8000") == [3000, 5173, 8000]


def test_parse_scan_ports_ignores_empty_parts() -> None:
    assert parse_scan_ports("3000,,5173,") == [3000, 5173]


def test_parse_scan_ports_rejects_out_of_range_ports() -> None:
    with pytest.raises(ValueError, match="Port out of range"):
        parse_scan_ports("0,3000")


def test_parse_scan_ports_rejects_non_numeric_ports() -> None:
    with pytest.raises(ValueError):
        parse_scan_ports("3000,abc")
