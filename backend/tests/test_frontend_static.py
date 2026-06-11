from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import register_frontend


def test_register_frontend_serves_index_when_dist_exists(tmp_path: Path) -> None:
    dist_dir = tmp_path / "dist"
    dist_dir.mkdir()
    (dist_dir / "index.html").write_text("<html>Localdeck</html>", encoding="utf-8")
    app = FastAPI()

    register_frontend(app, dist_dir)

    response = TestClient(app).get("/")

    assert response.status_code == 200
    assert response.text == "<html>Localdeck</html>"


def test_register_frontend_skips_missing_dist(tmp_path: Path) -> None:
    app = FastAPI()

    register_frontend(app, tmp_path / "missing")

    response = TestClient(app).get("/")

    assert response.status_code == 404
