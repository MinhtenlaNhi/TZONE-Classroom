import { Navigate } from "react-router-dom";

/** Lịch sử mua hàng đã chuyển vào trang Giỏ hàng. */
export default function OrderHistoryPage() {
  return <Navigate to="/cart?tab=history" replace />;
}
