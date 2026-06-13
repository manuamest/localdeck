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
    candidates: list[tuple[int, str]] = []

    for link in soup.find_all("link"):
        rel_values = link.get("rel") or []
        normalized_rel = {str(value).lower() for value in rel_values}
        href = link.get("href")

        if not href:
            continue

        if "icon" in normalized_rel and "shortcut" not in normalized_rel:
            candidates.append((_favicon_score(str(href), 0), str(href)))
        elif {"shortcut", "icon"}.issubset(normalized_rel):
            candidates.append((_favicon_score(str(href), 10), str(href)))
        elif "apple-touch-icon" in normalized_rel:
            candidates.append((_favicon_score(str(href), 20), str(href)))

    if candidates:
        _, href = min(candidates, key=lambda candidate: candidate[0])
        return urljoin(base_url, href)

    return urljoin(base_url, "/favicon.ico")


def _favicon_score(href: str, base_score: int) -> int:
    lowered = href.lower().split("?", maxsplit=1)[0]
    if lowered.endswith(".svg"):
        return base_score
    if lowered.endswith(".png"):
        return base_score + 1
    if lowered.endswith(".ico"):
        return base_score + 2
    return base_score + 3
