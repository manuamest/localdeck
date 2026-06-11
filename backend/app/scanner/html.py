from urllib.parse import urljoin

from bs4 import BeautifulSoup


def extract_title(html: str) -> str | None:
    soup = BeautifulSoup(html, "html.parser")
    title = soup.find("title")
    if title is None:
        return None

    text = " ".join(title.get_text(" ", strip=True).split())
    return text or None


def extract_favicon_url(html: str, base_url: str) -> str:
    soup = BeautifulSoup(html, "html.parser")

    for link in soup.find_all("link"):
        rel_values = link.get("rel") or []
        normalized_rel = {str(value).lower() for value in rel_values}
        if not ({"icon", "shortcut"} & normalized_rel):
            continue

        href = link.get("href")
        if href:
            return urljoin(base_url, str(href))

    return urljoin(base_url, "/favicon.ico")
