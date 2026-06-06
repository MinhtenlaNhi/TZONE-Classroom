import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <>
      {/* Pre-footer Features */}
      <div className="tz-pre-footer">
        <div className="tz-pf-container">
          <div className="tz-pf-item">
            <div className="tz-pf-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg></div>
            <div>
              <strong>Hỗ trợ học viên 24/7</strong>
              <p>Giải đáp mọi thắc mắc</p>
            </div>
          </div>
          <div className="tz-pf-item">
            <div className="tz-pf-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.92-5.57L21.5 8"></path></svg></div>
            <div>
              <strong>Học lại miễn phí</strong>
              <p>Nếu không đạt cam kết</p>
            </div>
          </div>
          <div className="tz-pf-item">
            <div className="tz-pf-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></div>
            <div>
              <strong>Tài liệu độc quyền</strong>
              <p>Chuẩn ETS cập nhật liên tục</p>
            </div>
          </div>
          <div className="tz-pf-item">
            <div className="tz-pf-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg></div>
            <div>
              <strong>Thanh toán linh hoạt</strong>
              <p>Nhiều phương thức tiện lợi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="tz-footer">
        <div className="tz-footer-container">
          <div className="tz-footer-col tz-col-brand">
            <Link to="/" className="tz-footer-logo"><span className="tz-logo-icon">TZ</span> TZONE</Link>
            <p>Nền tảng học TOEIC online hàng đầu Việt Nam. Giải pháp chinh phục mục tiêu 800+ một cách dễ dàng.</p>
            <div className="tz-socials">
              <a href="#fb" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#yt" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
              <a href="#tt" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91.04.16 2.53 1.5 4.47 3.565 5.5v3.86c-1.74-.21-3.23-.9-4.52-1.95v7.26c-.05 3.9-3.2 7.07-7.1 7.06-3.83 0-6.95-3-7-6.85-.04-3.66 2.76-6.73 6.36-7V11.8c-1.8.06-3.32 1.44-3.5 3.25-.18 1.93 1.14 3.65 3.02 3.99 2.05.37 3.98-.89 4.38-2.91.07-.36.1-.73.1-1.1V.02z"/></svg>
              </a>
              <a href="#ig" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>

          <div className="tz-footer-col">
            <h4>VỀ TZONE</h4>
            <Link to="/#top">Giới thiệu</Link>
            <Link to="/#khoa-hoc-sap-khai-giang">Khóa học</Link>
            <Link to="/#giang-vien-tieu-bieu">Giảng viên</Link>
            <Link to="/#danh-gia">Đánh giá</Link>
          </div>

          <div className="tz-footer-col">
            <h4>HỖ TRỢ</h4>
            <Link to="/ho-tro-yeu-cau">Hỗ trợ học viên</Link>
            <Link to="/dieu-khoan-bao-hanh">Điều khoản bảo lưu</Link>
          </div>

          <div className="tz-footer-col tz-col-contact">
            <h4>LIÊN HỆ</h4>
            <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> 0964 767 902</p>
            <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> tzone.classroom.web@gmail.com</p>
            <p><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> 123 Nguyễn Xiển, Hà Nội</p>
          </div>

          <div className="tz-footer-col tz-col-pay">
            <h4>Phương thức thanh toán</h4>
            <div className="tz-pay-icons">
              <img src="/images/payments/mb.png" alt="MB" />
              <img src="/images/payments/vietcombank.png" alt="VCB" />
              <img src="/images/payments/techcombank.png" alt="TCB" />
              <img src="/images/payments/momo.png" alt="MoMo" />
            </div>
          </div>
        </div>
        <div className="tz-footer-bottom">
          <p>© 2024 TZONE. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
