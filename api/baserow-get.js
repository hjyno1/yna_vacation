export default async function handler(req, res) {
  const API_TOKEN = process.env.BASEROW_API_KEY;
  const TABLE_ID = process.env.BASEROW_TABLE_ID;

  const today = new Date();
  const start = new Date(today.getFullYear() - 1, today.getMonth(), 1); // 과거 1년
  const end = new Date(today.getFullYear(), today.getMonth() + 3, 0);   // 미래 3개월

  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  const url = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/?user_field_names=true&size=200&filter__date__gte=${startStr}&filter__date__lte=${endStr}`;

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Token ${API_TOKEN}` },
    });

    const data = await response.json();

    const simplified = data?.results?.map(row => ({
      id: row.id,
      name: row.name,
      date: row.date,
      label: row.label,
    })) || [];

    res.status(200).json(simplified);
  } catch (err) {
    console.error("Baserow 데이터 불러오기 오류:", err);
    res.status(500).json({ error: "데이터 불러오기 실패" });
  }
}
