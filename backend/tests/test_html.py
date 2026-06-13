from app.scanner.html import extract_favicon_url, extract_title


def test_extract_title_returns_normalized_title() -> None:
    html = "<html><head><title>  My   Local   App  </title></head></html>"

    assert extract_title(html) == "My Local App"


def test_extract_title_returns_none_when_missing() -> None:
    assert extract_title("<html><body>No title</body></html>") is None


def test_extract_title_handles_malformed_html() -> None:
    assert extract_title("<title>Broken") == "Broken"


def test_extract_favicon_url_resolves_relative_icon() -> None:
    html = '<html><head><link rel="icon" href="/static/icon.png"></head></html>'

    assert (
        extract_favicon_url(html, "http://localhost:5173")
        == "http://localhost:5173/static/icon.png"
    )


def test_extract_favicon_url_resolves_absolute_icon() -> None:
    html = '<html><head><link rel="shortcut icon" href="http://localhost:3000/a.ico"></head></html>'

    assert extract_favicon_url(html, "http://localhost:5173") == "http://localhost:3000/a.ico"


def test_extract_favicon_url_falls_back_to_favicon_ico() -> None:
    assert extract_favicon_url("<html></html>", "http://localhost:8000") == "http://localhost:8000/favicon.ico"


def test_extract_favicon_url_prefers_svg_icon_when_multiple_icons_exist() -> None:
    html = """
    <html>
      <head>
        <link rel="icon" href="/favicon.ico">
        <link rel="icon" href="/favicon.svg">
      </head>
    </html>
    """

    assert extract_favicon_url(html, "http://localhost:3000") == "http://localhost:3000/favicon.svg"


def test_extract_favicon_url_uses_apple_touch_icon() -> None:
    html = '<html><head><link rel="apple-touch-icon" href="/apple.png"></head></html>'

    assert extract_favicon_url(html, "http://localhost:3000") == "http://localhost:3000/apple.png"


def test_extract_favicon_url_prefers_icon_over_apple_touch_icon() -> None:
    html = """
    <html>
      <head>
        <link rel="apple-touch-icon" href="/apple.png">
        <link rel="icon" href="/favicon.png">
      </head>
    </html>
    """

    assert extract_favicon_url(html, "http://localhost:3000") == "http://localhost:3000/favicon.png"
