from dataclasses import dataclass


@dataclass(frozen=True)
class Classification:
    runtime_hint: str
    framework_hint: str
    confidence: float
    evidence: list[str]


def classify_service(title: str, port: int, docker_image: str | None = None) -> Classification:
    haystack = " ".join(value.lower() for value in [title, docker_image or ""] if value)
    evidence: list[str] = []

    if "portainer" in haystack:
        return _classification("docker", "portainer", 0.95, "matched Portainer title/image")
    if "pgadmin" in haystack:
        return _classification("docker", "pgadmin", 0.95, "matched pgAdmin title/image")
    if "adminer" in haystack:
        return _classification("docker", "adminer", 0.95, "matched Adminer title/image")
    if "dozzle" in haystack:
        return _classification("docker", "dozzle", 0.95, "matched Dozzle title/image")
    if "file browser" in haystack or "filebrowser" in haystack:
        return _classification("docker", "filebrowser", 0.9, "matched File Browser title/image")

    if "vite" in haystack or port == 5173:
        return _classification("javascript", "vite", 0.85, "matched Vite title or default port")
    if "next.js" in haystack or "nextjs" in haystack:
        return _classification("javascript", "nextjs", 0.85, "matched Next.js title/image")
    if "react" in haystack:
        return _classification("javascript", "react", 0.75, "matched React title/image")
    if port in {3000, 3001, 4173, 4200, 5500}:
        return _classification("javascript", "unknown", 0.55, f"matched common JavaScript dev port {port}")

    if "fastapi" in haystack or "uvicorn" in haystack:
        return _classification("python", "fastapi", 0.85, "matched FastAPI/Uvicorn title/image")
    if "django" in haystack:
        return _classification("python", "django", 0.85, "matched Django title/image")
    if "flask" in haystack:
        return _classification("python", "flask", 0.85, "matched Flask title/image")
    if "python" in haystack or port in {5000, 8000, 8001, 8002, 8003, 8004, 8005, 8006, 8007, 8008, 8009, 8010}:
        return _classification("python", "unknown", 0.55, "matched Python title/image or common Python app port")

    if "streamlit" in haystack or port == 8501:
        return _classification("ml", "streamlit", 0.85, "matched Streamlit title/image or default port")
    if "gradio" in haystack or port == 7860:
        return _classification("ml", "gradio", 0.85, "matched Gradio title/image or default port")
    if "ollama" in haystack or port == 11434:
        return _classification("ml", "ollama", 0.85, "matched Ollama title/image or default port")
    if "langflow" in haystack:
        return _classification("ml", "langflow", 0.85, "matched Langflow title/image")

    evidence.append("HTTP response confirms a web service")
    return Classification(runtime_hint="unknown", framework_hint="unknown", confidence=0.45, evidence=evidence)


def _classification(runtime_hint: str, framework_hint: str, confidence: float, evidence: str) -> Classification:
    return Classification(
        runtime_hint=runtime_hint,
        framework_hint=framework_hint,
        confidence=confidence,
        evidence=[evidence],
    )
