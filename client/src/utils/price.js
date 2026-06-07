/** Phân tích giá VN: "3.500.000", "3.500.000đ" -> 3500000 */
export function parsePrice(priceStr) {
  if (priceStr == null || priceStr === "") return 0;
  const numStr = String(priceStr).replace(/[^\d]/g, "");
  return parseInt(numStr, 10) || 0;
}

/** Hiển thị giá VN từ số hoặc chuỗi đã lưu. */
export function displayPrice(price, fallback = "Miễn phí") {
  if (price == null || price === "") return fallback;
  const str = String(price).trim();
  if (str.includes("đ")) return str;
  const amount = parsePrice(str);
  if (!amount) return fallback;
  return `${amount.toLocaleString("vi-VN")}đ`;
}
