# 🌦️ 날씨 웹앱

도시 이름을 입력하고 **날씨 확인** 버튼을 누르면 현재 날씨를 보여주는 간단한 웹앱입니다.

## 폴더 구조

```
날씨앱 만들기 실습 폴더/
├── backend/
│   └── server.js      ← 백엔드: 외부 날씨 API 호출 + 프론트엔드 파일 제공
├── frontend/
│   ├── index.html     ← 화면 구조
│   ├── style.css      ← 디자인
│   └── script.js      ← 버튼 클릭 시 백엔드에 날씨 요청
└── README.md
```

## 동작 흐름

```
[브라우저] --도시 이름--> [backend/server.js] --> Open-Meteo 도시 검색 API (위도/경도 찾기)
                                              --> Open-Meteo 날씨 API (현재 날씨)
[브라우저] <--날씨 JSON-- [backend/server.js]
```

- 날씨 데이터: [Open-Meteo](https://open-meteo.com) — **무료, API Key 필요 없음**
- 프레임워크 없이 Node.js 내장 기능만 사용 (`npm install` 필요 없음)

## 실행 방법

1. **Node.js 설치 확인**
   터미널(VS Code에서는 `Ctrl + ~`)에서 아래 명령을 입력합니다. 버전(예: `v20.x.x`)이 나오면 됩니다.
   ```
   node -v
   ```
   버전이 나오지 않으면 https://nodejs.org 에서 LTS 버전을 설치하세요. (18 이상 필요)

2. **프로젝트 폴더로 이동**
   VS Code에서 이 폴더를 열었다면 이미 이동되어 있습니다.

3. **백엔드 서버 실행**
   ```
   node backend/server.js
   ```
   `날씨 서버 실행 중: http://localhost:3000` 메시지가 나오면 성공입니다.

4. **브라우저에서 접속**
   주소창에 http://localhost:3000 을 입력합니다.

5. **날씨 확인**
   도시 이름(예: `서울`, `부산`, `Tokyo`, `London`)을 입력하고 **날씨 확인** 버튼을 누릅니다.

6. **서버 종료**
   서버를 실행한 터미널에서 `Ctrl + C`를 누릅니다.

## 참고

- `index.html` 파일을 더블클릭해서 열면 동작하지 않습니다. 반드시 백엔드 서버를 실행한 뒤 `http://localhost:3000`으로 접속하세요.
- 백엔드 API만 따로 확인하려면 브라우저에서 http://localhost:3000/api/weather?city=Seoul 을 열어 보세요.
- Open-Meteo는 한글 도시 이름 검색이 부정확해서, 주요 도시는 `server.js`의 `KOREAN_CITY_NAMES`에서 영문으로 바꿔 검색합니다. 목록에 없는 도시는 영문으로 입력하는 것이 정확합니다.
