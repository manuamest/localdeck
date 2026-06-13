from app.scanner.classify import classify_service


def test_classify_service_detects_vite_default_port() -> None:
    classification = classify_service("Local app", 5173)

    assert classification.runtime_hint == "javascript"
    assert classification.framework_hint == "vite"
    assert classification.confidence >= 0.8


def test_classify_service_detects_portainer_title() -> None:
    classification = classify_service("Portainer", 9000)

    assert classification.runtime_hint == "docker"
    assert classification.framework_hint == "portainer"


def test_classify_service_detects_streamlit_port() -> None:
    classification = classify_service("Service on port 8501", 8501)

    assert classification.runtime_hint == "ml"
    assert classification.framework_hint == "streamlit"
