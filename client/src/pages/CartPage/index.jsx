import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchCart, removeFromCart } from "../../api/cartApi";
import { getAuth } from "../../auth/auth";
import OrderHistoryContent from "../../components/OrderHistoryContent";
import "./CartPage.css";
import { apiPath } from "../../api/base";

export default function CartPage() {
  const auth = getAuth();
  const authEmail = auth?.email;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "history" ? "history" : "cart";

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchCart();
      if (res.success) {
        setCart(res.cart);
      } else {
        setError(res.message || "Không thể tải giỏ hàng.");
        toast.error(res.message || "Không thể tải giỏ hàng.");
      }
    } catch {
      setError("Không thể tải giỏ hàng.");
      toast.error("Không thể tải giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authEmail) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    if (activeTab === "cart") {
      loadCart();
    } else {
      setLoading(false);
    }
  }, [authEmail, navigate, activeTab]);

  const handleRemove = async (courseId) => {
    try {
      const res = await removeFromCart(courseId);
      if (res.success) {
        toast.success("Đã xóa khỏi giỏ hàng");
        loadCart();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Lỗi xóa khóa học");
    }
  };

  const setTab = (tab) => {
    if (tab === "history") {
      setSearchParams({ tab: "history" });
    } else {
      setSearchParams({});
    }
  };

  if (loading && activeTab === "cart") {
    return <div className="cart-page-loading">Đang tải giỏ hàng...</div>;
  }

  const items = cart?.items || [];

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const course = item.courseRef;
      if (!course || !course.price) return total;
      const numStr = course.price.toString().replace(/[^\d]/g, "");
      return total + (parseInt(numStr, 10) || 0);
    }, 0);
  };

  const totalAmount = calculateTotal();

  const getCoverInitials = (catName, courseTitle) => {
    const text = catName?.toUpperCase() || courseTitle?.toUpperCase() || "KH";
    if (text.includes("TOEIC B")) return "TB";
    if (text.includes("TOEIC A")) return "TA";
    if (text.includes("TẬP SỰ")) return "TS";
    if (text.includes("SPEAKING")) return "TS";
    return text.substring(0, 2);
  };

  const getCoverColorClass = (catName) => {
    const name = catName?.toUpperCase() || "";
    if (name.includes("TOEIC B")) return "cp-cover-green";
    if (name.includes("TOEIC A")) return "cp-cover-blue";
    if (name.includes("TẬP SỰ")) return "cp-cover-orange";
    if (name.includes("SPEAKING")) return "cp-cover-blue";
    return "cp-cover-blue";
  };

  return (
    <div className="cart-page">
      <div className="cart-page__header">
        <h1>Giỏ hàng</h1>
        <p>
          {activeTab === "cart"
            ? `Bạn có ${items.length} khóa học trong giỏ hàng`
            : "Theo dõi trạng thái các đơn đăng ký khóa học của bạn"}
        </p>
      </div>

      <div className="cart-page__tabs" role="tablist" aria-label="Giỏ hàng và lịch sử mua hàng">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "cart"}
          className={`cart-page__tab ${activeTab === "cart" ? "cart-page__tab--active" : ""}`}
          onClick={() => setTab("cart")}
        >
          Giỏ hàng của bạn
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "history"}
          className={`cart-page__tab ${activeTab === "history" ? "cart-page__tab--active" : ""}`}
          onClick={() => setTab("history")}
        >
          Lịch sử mua hàng
        </button>
      </div>

      {activeTab === "history" ? (
        <OrderHistoryContent embedded />
      ) : error ? (
        <div className="cart-page__empty">
          <p className="text-danger">{error}</p>
          <button type="button" onClick={loadCart} className="btn-primary">
            Thử lại
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="cart-page__empty">
          <p>Giỏ hàng đang trống.</p>
          <Link to="/courses" className="btn-primary">
            Khám phá khóa học ngay
          </Link>
        </div>
      ) : (
        <div className="cart-page__content">
          <div className="cart-page__list">
            {items.map((item) => {
              const course = item.courseRef;
              if (!course) return null;

              const catName = course.categoryRef?.name || course.categoryId || "";
              const coverText = getCoverInitials(catName, course.title);
              const colorClass = getCoverColorClass(catName);

              return (
                <div className="cart-item" key={course._id}>
                  <div className="cart-item__img">
                    {course.thumbnail ? (
                      <img src={`${apiPath(course.thumbnail)}`} alt={course.title} />
                    ) : (
                      <div className={`cart-item__placeholder ${colorClass}`}>
                        <span className="cart-item__initials">{coverText}</span>
                      </div>
                    )}
                  </div>
                  <div className="cart-item__info">
                    <div className="cart-item__cat">{course.categoryRef?.name}</div>
                    <h3 className="cart-item__title">{course.title}</h3>
                    <div className="cart-item__meta">
                      🕒 {course.totalSessions} buổi ({course.sessionDuration} phút/buổi)
                    </div>
                  </div>
                  <div className="cart-item__price-actions">
                    <div className="cart-item__price">{course.price || "Miễn phí"}</div>
                    <button type="button" className="cart-item__remove" onClick={() => handleRemove(course._id)}>
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="cart-page__summary">
            <h3>Tổng giỏ hàng</h3>
            <div className="summary-row">
              <span>Tổng cộng:</span>
              <span className="summary-total">{totalAmount.toLocaleString("vi-VN")}đ</span>
            </div>
            <Link to="/checkout" className="btn-checkout">
              Tiến hành thanh toán
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
