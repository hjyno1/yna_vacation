export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "허용되지 않은 요청 방식입니다." });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, message: "삭제할 이름이 없습니다." });
  }

  const API_TOKEN = process.env.BASEROW_API_KEY;
  const TABLE_ID = process.env.BASEROW_TABLE_ID;

  try {
    const deleteURL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/${id}/`;

    const response = await fetch(deleteURL, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error("삭제 실패");
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Baserow 삭제 오류:", err);
    res.status(500).json({ success: false, message: "삭제 중 오류 발생" });
  }
}
