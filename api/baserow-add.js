export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "허용되지 않은 요청 방식입니다." });
  }

  const { name, start, end, type } = req.body;

  if (!name || !start || !end) {
    return res.status(400).json({ success: false, message: "입력값이 부족합니다." });
  }

  const API_TOKEN = process.env.BASEROW_API_KEY;
  const TABLE_ID = process.env.BASEROW_TABLE_ID;

  try {
    // 날짜별로 분해 (예: 2025-06-21 ~ 2025-06-23 → 3개 생성)
    const dates = getDateRange(start, end);

    const rows = dates.map(date => ({
      name,
      date,
      label: `${name} (${type || "종일"})`
    }));

    const response = await fetch(`https://api.baserow.io/api/database/rows/table/${TABLE_ID}/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: rows }),
    });

    if (!response.ok) throw new Error("Baserow 등록 실패");

    const result = await response.json();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("등록 오류:", err);
    res.status(500).json({ success: false, message: "등록 중 오류 발생" });
  }
}

function getDateRange(startStr, endStr) {
  const result = [];
  let current = new Date(startStr);
  const end = new Date(endStr);

  while (current <= end) {
    result.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return result;
}
