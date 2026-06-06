import { Link } from "react-router-dom";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import "../../pages/Home/styles.css";
import "../SupportPages/SupportPages.css";

const SUPPORT_EMAIL = "tzone.classroom.web@gmail.com";
const DEFERRAL_FORM = "/forms/don-xin-nghi-hoc-bao-luu.docx";

export default function WarrantyTermsPage() {
  return (
    <div className="tz-support-page">
      <PublicHeader />
      <main className="tz-support-main tz-warranty-main">
        <h1>Điều khoản bảo lưu</h1>
        <h2 className="tz-warranty-subtitle">CHÍNH SÁCH BẢO LƯU KHÓA HỌC TẠI TZONE</h2>
        <p className="tz-support-lead">
          Để đảm bảo quyền lợi học tập tối đa khi phát sinh công việc cá nhân bất ngờ, TZONE hỗ trợ học viên
          bảo lưu khóa học theo các quy định cụ thể dưới đây. Học viên vui lòng đọc kỹ trước khi làm thủ tục.
        </p>

        <section className="tz-warranty-section">
          <h2>1. Điều kiện được bảo lưu</h2>
          <p>
            Học viên được tiếp nhận bảo lưu{" "}
            <strong className="tz-warranty-highlight">không mất phí</strong> hoặc được xem xét giải quyết
            riêng tùy theo thời điểm và lý do bảo lưu:
          </p>

          <div className="tz-warranty-case">
            <h3>Trường hợp 1: Khóa học CHƯA KHAI GIẢNG</h3>
            <p>
              Học viên đã hoàn thành học phí nhưng vì lý do cá nhân không thể tham gia lớp đúng lịch khai giảng.
            </p>
            <p>
              <strong>Quyền lợi:</strong> Được bảo lưu miễn phí <strong>01 lần</strong> và chuyển sang khóa
              khai giảng tiếp theo có lịch phù hợp.
            </p>
          </div>

          <div className="tz-warranty-case">
            <h3>Trường hợp 2: Khóa học ĐANG DIỄN RA</h3>
            <p>
              <strong>Bảo lưu miễn phí</strong> (cần cung cấp minh chứng hợp lệ kèm đơn):
            </p>
            <ul>
              <li>
                Lịch nhập ngũ, lịch thực tập tốt nghiệp trùng lịch học (nộp kèm thông báo/quyết định chính
                thức từ nhà trường).
              </li>
              <li>
                Vấn đề sức khỏe đột xuất cần nhập viện hoặc điều trị dài ngày (nộp kèm giấy xác nhận từ
                bệnh viện/bác sĩ chuyên khoa).
              </li>
            </ul>
            <p>
              <strong>Xem xét riêng các lý do cá nhân khác:</strong> Với trường hợp bảo lưu do lý do cá nhân
              phát sinh (không có minh chứng) hoặc bảo lưu từ lần thứ 2 trở đi trong cùng lộ trình, trung tâm
              sẽ xem xét và giải quyết từng trường hợp. Tùy thời điểm và chính sách hiện hành, bảo lưu có thể
              phát sinh chi phí hoặc áp dụng thêm điều kiện ràng buộc.
            </p>
          </div>
        </section>

        <section className="tz-warranty-section">
          <h2>2. Thời gian bảo lưu và quy định quay lại học</h2>
          <ul>
            <li>
              <strong>Thời gian bảo lưu tối đa:</strong> Không quá{" "}
              <strong className="tz-warranty-highlight">3 tháng</strong> kể từ ngày đơn bảo lưu được bộ phận
              vận hành duyệt thành công.
            </li>
            <li>
              <strong>Lưu ý khi quay lại học:</strong> Học viên cần chủ động liên hệ TZONE trước khi hết hạn
              bảo lưu để làm bài <strong className="tz-warranty-highlight">Đánh giá lại năng lực</strong>.
              Dựa trên kết quả, trung tâm sẽ xếp lớp phù hợp nhất với trình độ tại thời điểm đó.
            </li>
            <li>
              Quá thời hạn bảo lưu 3 tháng, nếu học viên không tự ôn luyện, không tham gia đánh giá lại hoặc
              không đủ điều kiện tiếp tục khóa học, học viên sẽ áp dụng chính sách{" "}
              <strong className="tz-warranty-highlight">Học phí học lại</strong> (đóng phí học lại từ đầu) theo
              quy định của trung tâm.
            </li>
          </ul>
        </section>

        <section className="tz-warranty-section tz-warranty-section--cta">
          <h2>3. Hướng dẫn làm thủ tục bảo lưu</h2>
          <p>Để gửi yêu cầu bảo lưu, học viên vui lòng:</p>
          <ol className="tz-warranty-steps">
            <li>
              Tải{" "}
              <a className="tz-support-download-btn tz-warranty-download-inline" href={DEFERRAL_FORM} download="TZONE-Don-Nghi-Hoc-Bao-Luu.docx">
                Mẫu đơn bảo lưu tại đây
              </a>
              {" "}hoặc vào trang{" "}
              <Link className="tz-support-email" to="/ho-tro-yeu-cau">
                Hỗ trợ yêu cầu
              </Link>
              .
            </li>
            <li>Điền đầy đủ thông tin, đính kèm minh chứng (nếu có).</li>
            <li>
              Gửi email tới bộ phận vận hành TZONE:{" "}
              <a className="tz-support-email" href={`mailto:${SUPPORT_EMAIL}`}>
                {SUPPORT_EMAIL}
              </a>
            </li>
            <li>
              Tiêu đề email theo cú pháp:{" "}
              <code className="tz-warranty-code">[BẢO LƯU] - Họ tên - Tên khóa học</code>
            </li>
          </ol>
        </section>

        <section className="tz-warranty-section">
          <h2>Liên hệ</h2>
          <p>
            Mọi thắc mắc về chính sách bảo lưu, vui lòng liên hệ{" "}
            <a className="tz-support-email" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>{" "}
            hoặc hotline <strong>0964 767 902</strong>.
          </p>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
