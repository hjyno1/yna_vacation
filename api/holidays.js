export default async function handler(req, res) {
  const { year } = req.query;
  const apiKey = process.env.GOOGLE_API_KEY;
  const calendarId = encodeURIComponent("ko.south_korea#holiday@group.v.calendar.google.com");

  const timeMin = `${year}-01-01T00:00:00Z`;
  const timeMax = `${year}-12-31T23:59:59Z`;

  const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      return res.status(500).json({ error: "공휴일 데이터를 가져오지 못했습니다." });
    }

    const holidays = {};
    for (const event of data.items) {
      const date = event.start.date;
      const name = event.summary;
      holidays[date] = name;
    }

    // 사용자 지정 공휴일 추가
    holidays[`${year}-04-07`] = "신문의 날";
    holidays[`${year}-05-01`] = "근로자의 날";

    res.status(200).json(holidays);
  } catch (err) {
    console.error("Holiday fetch error:", err);
    res.status(500).json({ error: "공휴일 요청 실패" });
  }
}
