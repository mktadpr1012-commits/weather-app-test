// 간단한 날씨 백엔드 서버 (Node.js 내장 모듈만 사용, 설치 필요 없음)
// - GET /api/weather?city=서울  → 현재 날씨 JSON 반환
// - 그 외 경로                  → frontend 폴더의 정적 파일 제공
//
// 날씨 데이터: Open-Meteo (https://open-meteo.com) - API Key 필요 없음

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

// Open-Meteo 날씨 코드 → 한국어 설명 + 아이콘
const WEATHER_CODES = {
  0: ["맑음", "☀️"],
  1: ["대체로 맑음", "🌤️"],
  2: ["부분적으로 흐림", "⛅"],
  3: ["흐림", "☁️"],
  45: ["안개", "🌫️"],
  48: ["서리 안개", "🌫️"],
  51: ["약한 이슬비", "🌦️"],
  53: ["이슬비", "🌦️"],
  55: ["강한 이슬비", "🌧️"],
  61: ["약한 비", "🌦️"],
  63: ["비", "🌧️"],
  65: ["강한 비", "🌧️"],
  71: ["약한 눈", "🌨️"],
  73: ["눈", "🌨️"],
  75: ["강한 눈", "❄️"],
  77: ["싸락눈", "🌨️"],
  80: ["약한 소나기", "🌦️"],
  81: ["소나기", "🌧️"],
  82: ["강한 소나기", "⛈️"],
  85: ["약한 눈보라", "🌨️"],
  86: ["강한 눈보라", "❄️"],
  95: ["뇌우", "⛈️"],
  96: ["우박을 동반한 뇌우", "⛈️"],
  99: ["강한 우박을 동반한 뇌우", "⛈️"],
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

// Open-Meteo 도시 검색은 한글 이름 검색이 부정확해서, 주요 도시는 영문 이름으로 바꿔서 검색
const KOREAN_CITY_NAMES = {
  서울: "Seoul", 부산: "Busan", 대구: "Daegu", 인천: "Incheon", 광주: "Gwangju",
  대전: "Daejeon", 울산: "Ulsan", 세종: "Sejong", 수원: "Suwon", 제주: "Jeju",
  춘천: "Chuncheon", 강릉: "Gangneung", 청주: "Cheongju", 전주: "Jeonju", 포항: "Pohang",
  창원: "Changwon", 여수: "Yeosu", 경주: "Gyeongju", 천안: "Cheonan", 원주: "Wonju",
  도쿄: "Tokyo", 오사카: "Osaka", 베이징: "Beijing", 상하이: "Shanghai", 뉴욕: "New York",
  런던: "London", 파리: "Paris", 로마: "Rome", 시드니: "Sydney", 방콕: "Bangkok",
};

// 1단계: 도시 이름 → 위도/경도 (Open-Meteo Geocoding API)
async function findCity(city) {
  const name = KOREAN_CITY_NAMES[city.replace(/(특별시|광역시|시)$/, "")] || city;
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?count=10&language=ko&format=json&name=" +
    encodeURIComponent(name);
  const response = await fetch(url);
  if (!response.ok) throw new Error("도시 검색 서비스에 연결할 수 없습니다.");
  const data = await response.json();
  if (!data.results) return null;

  // 같은 이름의 작은 마을보다 큰 도시가 먼저 오도록 인구가 가장 많은 곳 선택
  return data.results.reduce((best, place) =>
    (place.population || 0) > (best.population || 0) ? place : best
  );
}

// 2단계: 위도/경도 → 현재 날씨 (Open-Meteo Forecast API)
async function getCurrentWeather(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${lat}&longitude=${lon}` +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m" +
    "&timezone=auto";
  const response = await fetch(url);
  if (!response.ok) throw new Error("날씨 서비스에 연결할 수 없습니다.");
  const data = await response.json();
  return data.current;
}

async function handleWeather(req, res, url) {
  const city = (url.searchParams.get("city") || "").trim();
  if (!city) {
    return sendJson(res, 400, { error: "도시 이름을 입력해 주세요." });
  }

  try {
    const place = await findCity(city);
    if (!place) {
      return sendJson(res, 404, { error: `'${city}' 도시를 찾을 수 없습니다.` });
    }

    const current = await getCurrentWeather(place.latitude, place.longitude);
    const [description, icon] = WEATHER_CODES[current.weather_code] || ["알 수 없음", "❔"];

    sendJson(res, 200, {
      city: place.name,
      country: place.country || "",
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      description,
      icon,
      time: current.time,
    });
  } catch (err) {
    console.error(err);
    sendJson(res, 502, { error: err.message || "날씨 정보를 가져오지 못했습니다." });
  }
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
    handleWeather(req, res, url);
  } else {
    serveStatic(res, decodeURIComponent(url.pathname));
  }
});

server.listen(PORT, () => {
  console.log(`날씨 서버 실행 중: http://localhost:${PORT}`);
  console.log("종료하려면 Ctrl + C 를 누르세요.");
});
