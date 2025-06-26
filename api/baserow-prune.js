export default async function handler(req, res) {
  const API_TOKEN = process.env.BASEROW_API_KEY;
  const TABLE_ID = process.env.BASEROW_TABLE_ID;

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  cutoff.setMonth(cutoff.getMonth(), 1); // 지난 1년 전의 해당 월 1일
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const listURL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/?user_field_names=true&size=200&filter__date__lt=${cutoffStr}`;

  try {
    const response = await fetch(listURL, {
      headers: { Authorization: `Token ${API_TOKEN}` },
    });

    const data = await response.json();
    const oldRows = data?.results || [];

    // 병렬로 삭제 요청 보내기
    const deletePromises = oldRows.map(row =>
      fetch(`https://api.baserow.io/api/database/rows/table/${TABLE_ID}/${row.id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${API_TOKEN}` },
      })
    );

    await Promise.all(deletePromises);

    res.status(200).json({ success: true, deletedCount: oldRows.length });
  } catch (err) {
    console.error("삭제 오류:", err);
    res.status(500).json({ success: false, message: "삭제 중 오류 발생" });
  }
}
