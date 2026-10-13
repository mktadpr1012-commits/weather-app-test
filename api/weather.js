// Vercel 배포용 백엔드 (서버리스 함수)
// Vercel은 api 폴더의 파일을 자동으로 /api/... 주소의 함수로 만들어 줍니다.
// GET /api/weather?city=서울  → 현재 날씨 JSON 반환

const { getWeather } = require("../backend/weather");

module.exports = async (req, res) => {
  const { status, body } = await getWeather(req.query.city);
  res.status(status).json(body);
};
