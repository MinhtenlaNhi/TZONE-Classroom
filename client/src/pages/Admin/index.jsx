import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { toggleBlockUser } from "../../api/adminApi";
import {
  createTeacher,
  fetchAllTeachers,
  updateTeacher
} from "../../api/adminTeachers";
import "./styles.css";

const EMPTY_FORM = { id: "", name: "", email: "", phone: "", password: "" };

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listErr, setListErr] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);

  const loadTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllTeachers();
      setTeachers(data.teachers || []);
      setListErr(null);
    } catch (e) {
      setListErr(e.message || "Không tải được danh sách giáo viên.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  function openCreate() {
    setModalMode("add");
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(teacher) {
    setModalMode("edit");
    setForm({
      id: teacher._id,
      name: teacher.name || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      password: ""
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!name || !email) {
      toast.error("Vui lòng nhập tên và email.");
      return;
    }
    if (modalMode === "add" && (!form.password || form.password.length < 6)) {
      toast.error("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    if (modalMode === "edit" && form.password && form.password.length < 6) {
      toast.error("Mật khẩu mới cần ít nhất 6 ký tự.");
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === "add") {
        const res = await createTeacher({ name, email, password: form.password, phone });
        toast.success(res.message || "Đã tạo giáo viên.");
      } else {
        const payload = { name, email, phone };
        if (form.password) payload.password = form.password;
        const res = await updateTeacher(form.id, payload);
        toast.success(res.message || "Đã cập nhật giáo viên.");
      }
      closeModal();
      await loadTeachers();
    } catch (err) {
      toast.error(err.message || "Thao tác thất bại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleBlock(teacher) {
    const action = teacher.isBlocked ? "Mở khóa" : "Khóa";
    if (!window.confirm(`${action} tài khoản "${teacher.name}" (${teacher.email})?`)) {
      return;
    }
    setActionId(teacher._id);
    try {
      const res = await toggleBlockUser(teacher._id);
      toast.success(res.message || `${action} thành công.`);
      setTeachers((rows) =>
        rows.map((t) => (t._id === teacher._id ? { ...t, isBlocked: res.isBlocked } : t))
      );
    } catch (err) {
      toast.error(err.message || "Không thể cập nhật trạng thái tài khoản.");
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="admin-page">
      <main className="admin-page__main admin-page__main--wide">
        <section className="admin-card admin-card--teachers" aria-labelledby="admin-teachers-heading">
          <div className="admin-card__head admin-card__head--row">
            <div>
              <span className="admin-card__pill">Giáo viên</span>
              <h2 id="admin-teachers-heading" className="admin-card__title">
                Quản lý giáo viên
              </h2>
              <p className="admin-card__desc">
                Tài khoản giáo viên do admin tạo và quản lý trực tiếp tại đây.
              </p>
            </div>
            <div className="admin-actions">
              <button type="button" className="admin-btn admin-btn--ghost" disabled={loading} onClick={loadTeachers}>
                {loading ? "Đang tải…" : "Làm mới"}
              </button>
              <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
                + Thêm giáo viên
              </button>
            </div>
          </div>

          {listErr ? (
            <p className="admin-page__err" role="alert">
              {listErr}
            </p>
          ) : null}

          <div className="admin-table-wrap">
            <h3 className="admin-subtitle">Danh sách giáo viên ({teachers.length})</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Tên</th>
                  <th>Mã GV</th>
                  <th>SĐT</th>
                  <th>Trạng thái</th>
                  <th>Cập nhật</th>
                  <th className="admin-table__th-actions">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && teachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-muted">
                      Đang tải…
                    </td>
                  </tr>
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-muted">
                      Chưa có giáo viên. Bấm &quot;Thêm giáo viên&quot; để tạo mới.
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t._id}>
                      <td>{t.email}</td>
                      <td>{t.name || "—"}</td>
                      <td>
                        {t.teacherCode ? (
                          <code className="admin-code">{t.teacherCode}</code>
                        ) : (
                          <span className="admin-muted">—</span>
                        )}
                      </td>
                      <td>{t.phone || "—"}</td>
                      <td>
                        <span className={`admin-badge admin-badge--${t.isBlocked ? "rejected" : "approved"}`}>
                          {t.isBlocked ? "Đã khóa" : "Hoạt động"}
                        </span>
                      </td>
                      <td>{formatDate(t.updatedAt)}</td>
                      <td className="admin-table__actions">
                        <div className="admin-icon-actions">
                          <button
                            type="button"
                            className="admin-btn-icon admin-btn-icon--edit"
                            title="Chỉnh sửa"
                            onClick={() => openEdit(t)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="admin-btn-icon admin-btn-icon--lock"
                            title={t.isBlocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                            disabled={actionId === t._id}
                            onClick={() => handleToggleBlock(t)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showModal ? (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal__title">
              {modalMode === "add" ? "Thêm giáo viên mới" : "Chỉnh sửa giáo viên"}
            </h3>
            <form onSubmit={handleSubmit} className="admin-modal__form">
              <label className="admin-modal__label">
                Họ và tên
                <input
                  className="admin-modal__input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label className="admin-modal__label">
                Email
                <input
                  type="email"
                  className="admin-modal__input"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </label>
              <label className="admin-modal__label">
                Số điện thoại
                <input
                  className="admin-modal__input"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Tùy chọn"
                />
              </label>
              <label className="admin-modal__label">
                {modalMode === "add" ? "Mật khẩu" : "Mật khẩu mới (để trống nếu không đổi)"}
                <input
                  type="password"
                  className="admin-modal__input"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required={modalMode === "add"}
                  minLength={modalMode === "add" ? 6 : undefined}
                />
              </label>
              <div className="admin-modal__actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
                  {submitting ? "Đang lưu…" : modalMode === "add" ? "Tạo giáo viên" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
