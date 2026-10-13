// 프론트엔드: 사용자가 입력한 도시 이름을 백엔드(/api/weather)로 보내고 결과를 화면에 표시

const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const message = document.getElementById("message");
const result = document.getElementById("result");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function showWeather(data) {
  document.getElementById("city-name").textContent =
    data.country ? `${data.city}, ${data.country}` : data.city;
  document.getElementById("weather-icon").textContent = data.icon;
  document.getElementById("temperature").textContent = `${Math.round(data.temperature)}°C`;
  document.getElementById("description").textContent = data.description;
  document.getElementById("feels-like").textContent = `${Math.round(data.feelsLike)}°C`;
  document.getElementById("humidity").textContent = `${data.humidity}%`;
  document.getElementById("wind").textContent = `${data.windSpeed} km/h`;
  document.getElementById("updated").textContent = `기준 시각(현지): ${data.time.replace("T", " ")}`;
  result.classList.remove("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // 페이지 새로고침 방지

  const city = cityInput.value.trim();
  if (!city) {
    showMessage("도시 이름을 입력해 주세요.", true);
    return;
  }

  searchBtn.disabled = true;
  result.classList.add("hidden");
  showMessage("날씨 정보를 불러오는 중...");

  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "날씨 정보를 가져오지 못했습니다.", true);
      return;
    }

    showMessage("");
    showWeather(data);
  } catch (err) {
    showMessage("서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해 주세요.", true);
  } finally {
    searchBtn.disabled = false;
  }
});
