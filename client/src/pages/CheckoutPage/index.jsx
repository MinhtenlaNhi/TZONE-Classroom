import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchCart } from "../../api/cartApi";
import { createOrder, fetchPaymentMethods } from "../../api/ordersApi";
import { getAuth } from "../../auth/auth";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const auth = getAuth();
  const authEmail = auth?.email;
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [paymentMethodsData, setPaymentMethodsData] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!authEmail) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    const loadData = async () => {
      try {
        const [resCart, resBanks] = await Promise.all([
          fetchCart(),
          fetchPaymentMethods()
        ]);
        if (resCart.success) {
          setCart(resCart.cart);
        }
        if (resBanks.success && resBanks.data?.length > 0) {
          setPaymentMethodsData(resBanks.data);
          setSelectedBankId(resBanks.data[0].id);
        }
      } catch (e) {
        toast.error("Không thể tải dữ liệu thanh toán.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [authEmail, navigate]);

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
  const selectedBank = paymentMethodsData.find(b => b.id === selectedBankId);

  if (loading) {
    return <div className="checkout-loading">Đang tải thông tin...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Không có khóa học nào để thanh toán</h2>
        <Link to="/courses" className="btn-primary">Xem khóa học</Link>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === "transfer" && !receiptFile) {
      toast.error("Vui lòng tải lên ảnh minh chứng chuyển khoản!");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("paymentMethod", paymentMethod);
      if (receiptFile) {
        formData.append("transferReceipt", receiptFile);
      }

      const res = await createOrder(formData);
      if (res.success) {
        setShowSuccessModal(true);
      } else {
        toast.error(res.message || "Có lỗi xảy ra khi đặt hàng.");
      }
    } catch (err) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-page__header">
        <h1>Thanh toán</h1>
        <p>Vui lòng hoàn tất thanh toán để tham gia khóa học</p>
      </div>

      <div className="checkout-page__layout">
        <div className="checkout-page__main">
          
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-section">
              <h2>1. Phương thức thanh toán</h2>
              <div className="payment-methods">
                <label className={`pm-option ${paymentMethod === 'transfer' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="transfer" 
                    checked={paymentMethod === "transfer"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="pm-label">Chuyển khoản ngân hàng</span>
                </label>
              </div>
            </div>

            {paymentMethod === "transfer" && selectedBank && (
              <div className="checkout-section transfer-details">
                <h2>2. Thông tin chuyển khoản</h2>
                <div className="bank-selection mb-4">
                  <p className="mb-2"><strong>Chọn ngân hàng / ví điện tử:</strong></p>
                  <div className="bank-options" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                    {paymentMethodsData.map(bank => (
                      <label key={bank.id} className={`bank-option-btn ${selectedBankId === bank.id ? 'active' : ''}`} style={{ 
                        padding: '8px 16px', 
                        border: selectedBankId === bank.id ? '2px solid var(--primary-color)' : '1px solid #ccc',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: selectedBankId === bank.id ? 'rgba(var(--primary-color-rgb, 43, 108, 176), 0.1)' : '#fff'
                      }}>
                        <input 
                          type="radio" 
                          name="bankId" 
                          value={bank.id} 
                          checked={selectedBankId === bank.id}
                          onChange={(e) => setSelectedBankId(e.target.value)}
                          style={{ display: 'none' }}
                        />
                        <span style={{ fontWeight: selectedBankId === bank.id ? '600' : 'normal', color: selectedBankId === bank.id ? 'var(--primary-color)' : '#333' }}>
                          {bank.id.toUpperCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bank-info-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
                  <div className="bank-info-text" style={{ flex: '1 1 300px' }}>
                    <p><strong>Ngân hàng / Ví:</strong> {selectedBank.branch}</p>
                    <p><strong>Chủ tài khoản:</strong> {selectedBank.accountName}</p>
                    <p><strong>Số tài khoản:</strong> <span className="highlight-account">{selectedBank.accountNumber}</span></p>
                    <p><strong>Số tiền:</strong> <span className="highlight-amount">{totalAmount.toLocaleString("vi-VN")}đ</span></p>
                    <p><strong>Nội dung CK:</strong> {auth.email}</p>
                    {selectedBank.note && <p><strong>Lưu ý:</strong> {selectedBank.note}</p>}
                  </div>
                  {selectedBank.qrImage && (
                    <div className="bank-qr" style={{ width: '200px', textAlign: 'center' }}>
                      <img src={selectedBank.qrImage} alt={`QR ${selectedBank.id}`} style={{ width: '100%', borderRadius: '8px', border: '1px solid #eee' }} />
                      <p style={{ fontSize: '13px', marginTop: '8px', color: '#666' }}>Quét mã để thanh toán nhanh</p>
                    </div>
                  )}
                </div>

                <div className="upload-receipt-group">
                  <label>Tải lên ảnh minh chứng chuyển khoản (Bắt buộc) <span className="text-danger">*</span></label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    ref={fileInputRef}
                  />
                  {receiptPreview && (
                    <div className="receipt-preview">
                      <img src={receiptPreview} alt="Receipt preview" />
                    </div>
                  )}
                  <p className="help-text">Sau khi đặt hàng, Admin sẽ kiểm tra và duyệt đơn hàng của bạn.</p>
                </div>
              </div>
            )}



            <div className="checkout-actions">
              <Link to="/cart" className="btn-cancel">← Quay lại giỏ hàng</Link>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? "Đang xử lý..." : "Xác nhận & Đặt hàng"}
              </button>
            </div>
          </form>

        </div>

        <aside className="checkout-page__sidebar">
          <div className="order-summary-card">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="order-items-mini">
              {items.map((item) => {
                const course = item.courseRef;
                if (!course) return null;
                return (
                  <div className="order-item-mini" key={course._id}>
                    <div className="oim-title">{course.title}</div>
                    <div className="oim-price">{course.price || "Miễn phí"}</div>
                  </div>
                );
              })}
            </div>
            
            <div className="order-total">
              <span>Tổng thanh toán</span>
              <span className="total-amount-highlight">{totalAmount.toLocaleString("vi-VN")}đ</span>
            </div>
          </div>
        </aside>
      </div>

      {showSuccessModal && (
        <div
          className="checkout-success-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-success-title"
        >
          <div className="checkout-success-modal">
            <div className="checkout-success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 id="checkout-success-title">Đặt hàng thành công!</h2>
            <p className="checkout-success-desc">
              Đơn hàng của bạn đã được ghi nhận và đang chờ <strong>Admin xác nhận</strong>.
              Sau khi đơn hàng được duyệt, một <strong>email hóa đơn xác nhận thanh toán</strong>{" "}
              sẽ được gửi về địa chỉ:
            </p>
            <div className="checkout-success-email">{authEmail}</div>
            <p className="checkout-success-note">
              Vui lòng kiểm tra hộp thư (bao gồm cả mục Spam/Quảng cáo) sau khi đơn hàng được duyệt.
            </p>
            <div className="checkout-success-actions">
              <button
                type="button"
                className="btn-success-primary"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/cart?tab=history");
                }}
              >
                Xem đơn hàng của tôi
              </button>
              <button
                type="button"
                className="btn-success-secondary"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/courses");
                }}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
