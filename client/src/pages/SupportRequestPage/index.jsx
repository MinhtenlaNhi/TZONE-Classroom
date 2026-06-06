import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import "../../pages/Home/styles.css";
import "../SupportPages/SupportPages.css";

const SUPPORT_EMAIL = "tzone.classroom.web@gmail.com";

const REQUEST_FORMS = [
  {
    id: "trinh-bay",
    title: "Đơn trình bày",
    description:
      "Dùng khi bạn cần trình bày nguyện vọng hoặc yêu cầu hỗ trợ liên quan đến khóa học (ghi rõ nội dung, giảng viên, thời gian học/thi).",
    preview: "/forms/don-trinh-bay.png",
    file: "/forms/don-trinh-bay.docx",
    downloadName: "TZONE-Don-Trinh-Bay.docx"
  },
  {
    id: "bao-luu",
    title: "Đơn xin nghỉ học tạm thời và bảo lưu kết quả học tập",
    description:
      "Dùng khi bạn cần nghỉ học tạm thời và bảo lưu kết quả (tối đa 3 tháng kể từ ngày bảo lưu).",
    preview: "/forms/don-xin-nghi-hoc-bao-luu.png",
    file: "/forms/don-xin-nghi-hoc-bao-luu.docx",
    downloadName: "TZONE-Don-Nghi-Hoc-Bao-Luu.docx"
  }
];

export default function SupportRequestPage() {
  return (
    <div className="tz-support-page">
      <PublicHeader />
      <main className="tz-support-main">
        <h1>Hỗ trợ yêu cầu</h1>
        <p className="tz-support-lead">
          Để gửi yêu cầu hỗ trợ tới Bộ phận vận hành Trung tâm TOEIC TZONE, vui lòng làm theo các bước sau.
        </p>

        <div className="tz-support-steps">
          <div className="tz-support-step">
            <span className="tz-support-step__num">1</span>
            <div>
              <strong>Tải mẫu đơn Word (.docx)</strong>
              <p>Chọn và tải file Word phù hợp về máy để điền trực tiếp trên máy tính.</p>
            </div>
          </div>
          <div className="tz-support-step">
            <span className="tz-support-step__num">2</span>
            <div>
              <strong>Điền đầy đủ thông tin</strong>
              <p>
                Mở file Word, ghi rõ họ tên, khóa học, số điện thoại, email và nội dung yêu cầu. In và ký tên theo hướng dẫn trên mẫu đơn.
              </p>
            </div>
          </div>
          <div className="tz-support-step">
            <span className="tz-support-step__num">3</span>
            <div>
              <strong>Gửi đơn qua email</strong>
              <p>
                Chụp/scan đơn đã ký và gửi tới{" "}
                <a className="tz-support-email" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
                . Tiêu đề email gợi ý: <em>[TZONE] Yêu cầu hỗ trợ — Họ tên — Khóa học</em>.
              </p>
            </div>
          </div>
        </div>

        <div className="tz-support-forms">
          {REQUEST_FORMS.map((form) => (
            <article key={form.id} className="tz-support-form-card">
              <div className="tz-support-form-card__head">
                <h3>{form.title}</h3>
                <p>{form.description}</p>
              </div>
              {form.preview ? (
                <div className="tz-support-form-card__preview">
                  <img src={form.preview} alt={`Xem trước ${form.title}`} />
                </div>
              ) : null}
              <div className="tz-support-form-card__actions">
                <a className="tz-support-download-btn" href={form.file} download={form.downloadName}>
                  Tải file Word (.docx)
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
