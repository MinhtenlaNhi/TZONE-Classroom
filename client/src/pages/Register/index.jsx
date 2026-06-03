import { Link, useNavigate } from "react-router-dom";
import { setPendingRegisterRole } from "../../auth/onboardingStorage";
import "./styles.css";

const IMG_TEACHER = "/images/register/teacher.png";
const IMG_STUDENT = "/images/register/student.png";

export default function RegisterPage() {
  const navigate = useNavigate();

  function goToDetails(role) {
    setPendingRegisterRole(role);
    navigate(`/register/details?role=${role}`);
  }

  return (
    <div className="register-page">
      <header className="register-page__header">
        <Link className="register-page__logo" to="/">
          TZONE
        </Link>
        <Link className="register-page__login" to="/login">
          Đăng nhập
        </Link>
      </header>

      <main className="register-page__main">
        <h1 className="register-page__title">Đăng ký tài khoản mới</h1>
        <p className="register-page__subtitle">Chọn vai trò để tiếp tục</p>

        <div className="register-page__roles">
          <div className="register-page__card">
            <div className="register-page__illu">
              <img
                className="register-page__illu-img"
                src={IMG_STUDENT}
                alt="Góc học tập với laptop, sổ tay và không gian học tập sáng tạo"
                width={280}
                height={280}
                decoding="async"
              />
            </div>
            <button
              type="button"
              className="register-page__cta"
              onClick={() => goToDetails("student")}
            >
              Tôi là học sinh
            </button>
          </div>

          <div className="register-page__card">
            <div className="register-page__illu">
              <img
                className="register-page__illu-img"
                src={IMG_TEACHER}
                alt="Giáo viên đánh giá và theo dõi danh sách công việc"
                width={280}
                height={280}
                decoding="async"
              />
            </div>
            <button
              type="button"
              className="register-page__cta"
              onClick={() => goToDetails("teacher")}
            >
              Tôi là giáo viên
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
