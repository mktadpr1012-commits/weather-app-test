// 로컬 실행용 날씨 백엔드 서버 (Node.js 내장 모듈만 사용, 설치 필요 없음)
// - GET /api/weather?city=서울  → 현재 날씨 JSON 반환
// - 그 외 경로                  → frontend 폴더의 정적 파일 제공
//
// Vercel 배포 시에는 이 파일 대신 api/weather.js 가 사용됩니다.

const http = require("http");
const fs = require("fs");
const path = require("path");
const { getWeather } = require("./weather");

const PORT = 3000;
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

async function handleWeather(res, url) {
  const { status, body } = await getWeather(url.searchParams.get("city"));
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function serveStatic(res, pathname) {
  const fileName = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = path.join(FRONTEND_DIR, fileName);

  // frontend 폴더 밖의 파일 접근 차단
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("파일을 찾을 수 없습니다.");
    }
    const type = MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/weather") {
    handleWeather(res, url);
  } else {
    serveStatic(res, decodeURIComponent(url.pathname));
  }
});

server.listen(PORT, () => {
  console.log(`날씨 서버 실행 중: http://localhost:${PORT}`);
  console.log("종료하려면 Ctrl + C 를 누르세요.");
});
