from app.scanner.docker import docker_metadata_by_port


def test_docker_metadata_by_port_reads_public_web_ports_and_compose_labels() -> None:
    metadata = docker_metadata_by_port(
        [
            {
                "Id": "abc123",
                "Names": ["/demo-web"],
                "Image": "demo/app:latest",
                "Labels": {
                    "com.docker.compose.project": "demo",
                    "com.docker.compose.service": "web",
                },
                "Ports": [{"IP": "0.0.0.0", "PrivatePort": 8000, "PublicPort": 8080, "Type": "tcp"}],
            }
        ]
    )

    assert metadata[8080].container_name == "demo-web"
    assert metadata[8080].image == "demo/app:latest"
    assert metadata[8080].compose_project == "demo"
    assert metadata[8080].compose_service == "web"
    assert "Compose service web" in metadata[8080].evidence


def test_docker_metadata_by_port_ignores_unpublished_ports() -> None:
    metadata = docker_metadata_by_port(
        [
            {
                "Names": ["/db"],
                "Image": "postgres:latest",
                "Labels": {},
                "Ports": [{"PrivatePort": 5432, "Type": "tcp"}],
            }
        ]
    )

    assert metadata == {}
