import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchAdminOrders, confirmOrder, cancelOrder } from "../../api/ordersApi";
import { 
  FiShoppingCart, FiClock, FiCheckCircle, FiXCircle, 
  FiSearch, FiCalendar, FiCheck, FiX, FiImage, FiTrash2
} from "react-icons/fi";
import "./AdminOrders.css";
import { apiPath } from "../../api/base";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState("pending");

  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminOrders(page, 10, statusFilter);
      if (res.success) {
        setOrders(res.orders);
        setTotalPages(res.totalPages);
        setTotalItems(res.total || 0);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        toast.error("Lỗi tải danh sách đơn hàng.");
      }
    } catch (e) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const handleConfirm = async (orderId) => {
    if (!window.confirm("Xác nhận đã nhận tiền và duyệt đơn hàng này?")) return;
    try {
      const res = await confirmOrder(orderId);
      if (res.success) {
        toast.success("Duyệt đơn hàng thành công!");
        loadOrders();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi duyệt đơn hàng");
    }
  };

  const handleCancel = async (orderId) => {
    const reason = window.prompt("Nhập lý do hủy (Tùy chọn):");
    if (reason === null) return; // cancel prompt

    try {
      const res = await cancelOrder(orderId, reason);
      if (res.success) {
        toast.success("Đã hủy đơn hàng");
        loadOrders();
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi hủy đơn hàng");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": 
        return <span className="badge badge-warning"><FiClock className="badge-icon" /> Chờ duyệt</span>;
      case "paid": 
        return <span className="badge badge-success"><FiCheck className="badge-icon" /> Đã duyệt</span>;
      case "cancelled": 
        return <span className="badge badge-danger"><FiX className="badge-icon" /> Đã hủy</span>;
      default: 
        return <span className="badge">{status}</span>;
    }
  };

  const getAvatarInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts[parts.length - 1].charAt(0).toUpperCase();
  };

  // Tính số thứ tự bản ghi đang hiển thị
  const startItem = (page - 1) * 10 + (orders.length > 0 ? 1 : 0);
  const endItem = startItem + orders.length - (orders.length > 0 ? 1 : 0);

  return (
    <div className="admin-orders-page">
      <div className="ao-header-section">
        <div className="ao-title">
          <h1>Quản lý đơn hàng</h1>
          <p>Kiểm tra giao dịch chuyển khoản và cấp quyền vào lớp</p>
        </div>
        
        <div className="ao-summary-cards">
          <div className="ao-card">
            <div className="ao-card-icon bg-green-light">
              <FiShoppingCart className="text-green" />
            </div>
            <div className="ao-card-info">
              <span className="ao-card-label">Tổng đơn hàng</span>
              <div className="ao-card-value"><strong>{stats.total}</strong> <span>Đơn</span></div>
            </div>
          </div>
          <div className="ao-card">
            <div className="ao-card-icon bg-yellow-light">
              <FiClock className="text-yellow" />
            </div>
            <div className="ao-card-info">
              <span className="ao-card-label">Chờ duyệt</span>
              <div className="ao-card-value"><strong>{stats.pending}</strong> <span>Đơn</span></div>
            </div>
          </div>
          <div className="ao-card">
            <div className="ao-card-icon bg-success-light">
              <FiCheckCircle className="text-success" />
            </div>
            <div className="ao-card-info">
              <span className="ao-card-label">Đã duyệt</span>
              <div className="ao-card-value"><strong>{stats.paid}</strong> <span>Đơn</span></div>
            </div>
          </div>
          <div className="ao-card">
            <div className="ao-card-icon bg-danger-light">
              <FiXCircle className="text-danger" />
            </div>
            <div className="ao-card-info">
              <span className="ao-card-label">Đã hủy</span>
              <div className="ao-card-value"><strong>{stats.cancelled}</strong> <span>Đơn</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="ao-filters-bar">
        <div className="ao-filter-group">
          <label>Trạng thái:</label>
          <div className="ao-select-wrapper">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">Tất cả</option>
              <option value="pending">Chờ duyệt</option>
              <option value="paid">Đã duyệt</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
        <div className="ao-filter-group">
          <div className="ao-date-input">
            <FiCalendar className="date-icon" />
            <input type="text" placeholder="Chọn khoảng thời gian" readOnly />
          </div>
        </div>
      </div>

      <div className="ao-content-box">
        {loading ? (
          <div className="ao-loading">Đang tải dữ liệu...</div>
        ) : orders.length === 0 ? (
          <div className="ao-empty">Không có đơn hàng nào phù hợp.</div>
        ) : (
          <div className="ao-table-container">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Học viên</th>
                  <th>Khóa học</th>
                  <th>Tổng tiền</th>
                  <th>Phương thức</th>
                  <th>Minh chứng</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>
                      <span className="ao-order-code">
                        {o._id.substring(18).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="ao-user-cell">
                        <div className="ao-avatar">{getAvatarInitials(o.user?.name)}</div>
                        <div className="ao-user-info">
                          <strong className="ao-user-name">{o.user?.name || "Khách"}</strong>
                          <span className="ao-user-email">{o.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ao-course-list">
                        {o.items.map((i, idx) => (
                          <div key={idx} className="ao-course-item">– {i.courseRef?.title}</div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <strong className="ao-amount">{o.totalAmount.toLocaleString("vi-VN")}đ</strong>
                    </td>
                    <td>{o.paymentMethod.toUpperCase()}</td>
                    <td>
                      {o.transferReceipt ? (
                        <button 
                          className="ao-receipt-btn"
                          title="Xem minh chứng"
                          onClick={() => setSelectedReceipt(`${apiPath(o.transferReceipt)}`)}
                        >
                          <img src={apiPath(o.transferReceipt)} alt="Receipt Thumbnail" className="ao-receipt-thumb" />
                        </button>
                      ) : "-"}
                    </td>
                    <td>{getStatusBadge(o.status)}</td>
                    <td>
                      <div className="ao-actions">
                        {o.status === "pending" ? (
                          <>
                            <button className="ao-btn ao-btn-approve" onClick={() => handleConfirm(o._id)}>
                              <FiCheck /> Duyệt
                            </button>
                            <button className="ao-btn ao-btn-reject" onClick={() => handleCancel(o._id)}>
                              <FiTrash2 /> Hủy
                            </button>
                          </>
                        ) : (
                          <span className="ao-action-none">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="ao-pagination-wrapper">
            <div className="ao-pagination-info">
              Hiển thị {startItem} đến {endItem} trong tổng số {totalItems} đơn hàng
            </div>
            <div className="ao-pagination">
              <button className="ao-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>&lt;</button>
              
              {/* Render page numbers simple logic */}
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                // Chỉ hiện vài trang quanh trang hiện tại để khỏi dài
                if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                  return (
                    <button 
                      key={p} 
                      className={`ao-page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === page - 2 || p === page + 2) {
                  return <span key={p} className="ao-page-dots">...</span>;
                }
                return null;
              })}

              <button className="ao-page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>&gt;</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal View Receipt */}
      {selectedReceipt && (
        <div className="ao-modal-overlay" onClick={() => setSelectedReceipt(null)}>
          <div className="ao-modal-content" onClick={e => e.stopPropagation()}>
            <button className="ao-modal-close" onClick={() => setSelectedReceipt(null)}>
              <FiX />
            </button>
            <img src={selectedReceipt} alt="Receipt" />
          </div>
        </div>
      )}
    </div>
  );
}
