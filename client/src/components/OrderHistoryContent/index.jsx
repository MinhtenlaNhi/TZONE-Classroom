import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchMyOrders } from "../../api/ordersApi";
import { apiPath } from "../../api/base";
import "./OrderHistoryContent.css";

export default function OrderHistoryContent({ embedded = false }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await fetchMyOrders();
        if (res.success) {
          setOrders(res.orders || []);
        } else {
          toast.error(res.message || "Lỗi tải lịch sử đơn hàng");
        }
      } catch {
        toast.error("Lỗi kết nối");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="status-badge status-pending">Chờ xử lý</span>;
      case "paid":
        return <span className="status-badge status-paid">Đã thanh toán</span>;
      case "cancelled":
        return <span className="status-badge status-cancelled">Đã hủy</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const getPaymentMethod = (method) => {
    switch (method) {
      case "transfer":
        return "Chuyển khoản";
      default:
        return method;
    }
  };

  if (loading) {
    return <div className="order-history-loading">Đang tải lịch sử đơn hàng...</div>;
  }

  return (
    <div className={`order-history ${embedded ? "order-history--embedded" : ""}`}>
      {!embedded && (
        <div className="order-history__header">
          <h1>Lịch sử mua hàng</h1>
          <p>Theo dõi trạng thái các đơn đăng ký khóa học của bạn</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="order-history__empty">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/courses" className="btn-primary">
            Khám phá khóa học
          </Link>
        </div>
      ) : (
        <div className="order-history__list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-card__header">
                <div className="order-card__info-basic">
                  <span className="order-id">Mã ĐH: #{order._id.substring(18).toUpperCase()}</span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <div className="order-card__status">{getStatusBadge(order.status)}</div>
              </div>

              <div className="order-card__body">
                <div className="order-items">
                  {order.items.map((item, idx) => {
                    const course = item.courseRef;
                    return (
                      <div className="order-course" key={idx}>
                        <div className="order-course__img">
                          {course?.thumbnail ? (
                            <img src={`${apiPath(course.thumbnail)}`} alt={course?.title} />
                          ) : (
                            <div className="img-placeholder-small">TZONE</div>
                          )}
                        </div>
                        <div className="order-course__details">
                          <h4>{course?.title || "Khóa học không xác định"}</h4>
                          <span className="order-course__cat">{course?.categoryRef?.name}</span>
                        </div>
                        <div className="order-course__price">
                          {item.priceString || `${item.priceAtPurchase.toLocaleString("vi-VN")}đ`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="order-card__footer">
                <div className="order-payment-method">
                  Thanh toán qua: <strong>{getPaymentMethod(order.paymentMethod)}</strong>
                </div>
                <div className="order-total">
                  <span>Tổng tiền:</span>
                  <span className="total-val">{order.totalAmount.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              {order.status === "cancelled" && order.cancelReason && (
                <div className="order-card__alert">
                  <strong>Lý do hủy:</strong> {order.cancelReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
