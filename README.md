<div align="center">

<a href="https://github.com/manuamest/Localdeck">
<img src="./favicon.svg" alt="Localdeck Logo" width="100" type="image/svg+xml"/>
</a>

# Localdeck

**Zero-config local dashboard for developers.**

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

Localdeck answers one question: what web applications are currently running on your localhost? It scans common development ports, probes HTTP services, and shows live services as visual cards — no config required.

## How it works

1. Run `docker compose up --build` in the project root.
2. Open `http://localhost:4888` in your browser.
3. Localdeck automatically scans common dev ports, detects running services, and displays them as cards with title, favicon, and runtime classification.
4. Filter by type, sort by port/title/response time, or trigger a manual rescan — all from the UI.

That's it. Zero configuration needed.

## Features

- **Zero-Config Discovery:** Detects local web apps instantly — Docker, Docker Compose, Python, Node.js, and more.
- **Rich Service Cards:** Shows title, favicon, framework classification, and detected endpoints for each service.
- **Smart Filtering & Sorting:** Filter by runtime type (JavaScript, Python, Docker, ML, Other) and sort by port, title, or response time.
- **Docker Metadata Enrichment:** Mount the Docker socket (read-only) for container and Compose project metadata.
- **Privacy First:** Scans only local/private hosts. No external network access. No data leaves your machine.
- **Ephemeral by Design:** Stateless and disposable. Restart and it starts fresh.

## Contributing

Contributions are welcome! Feel free to open issues or pull requests.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open-source and licensed under the MIT License.

<div align="center">

## Support

If you find Localdeck useful, consider supporting the project:

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-support-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=000000)](https://www.buymeacoffee.com/manuamest)

</div>
