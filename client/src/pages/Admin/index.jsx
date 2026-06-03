import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPublicInstructors } from "../../api/instructors";
import {
  approveTeacher,
  fetchAllTeachers,
  fetchPendingTeachers,
  rejectTeacher
} from "../../api/adminTeachers";
import "./styles.css";

function statusLabel(status) {
  const s = status || "approved";
  if (s === "pending") return "Chờ duyệt";
  if (s === "rejected") return "Từ chối";
  return "Đã duyệt";
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

export default function AdminTeachersPage() {
  const [pending, setPending] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [actionEmail, setActionEmail] = useState(null);
  const [listErr, setListErr] = useState(null);
  const [pendingFetchDone, setPendingFetchDone] = useState(false);

  const loadPending = useCallback(async () => {
    setLoadingPending(true);
    try {
      const data = await fetchPendingTeachers();
      setPending(data.teachers || []);
      setListErr(null);
      setPendingFetchDone(true);
    } catch (e) {
      setListErr(e.message || "Không tải được danh sách.");
      setPendingFetchDone(false);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoadingAll(true);
    try {
      const data = await fetchAllTeachers();
      setAllTeachers(data.teachers || []);
    } catch (e) {
      setListErr(e.message || "Không tải được danh sách.");
    } finally {
      setLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
    loadAll();
  }, [loadPending, loadAll]);

  async function handleApprove(teacherEmail) {
    setActionEmail(teacherEmail);
    try {
      await approveTeacher({ teacherEmail });
      await loadPending();
      await loadAll();
    } catch (e) {
      setListErr(e.message || "Duyệt thất bại.");
    } finally {
      setActionEmail(null);
    }
  }

  async function handleReject(teacherEmail) {
    if (!window.confirm(`Từ chối tài khoản ${teacherEmail}? Giáo viên sẽ không đăng nhập được.`)) {
      return;
    }
    setActionEmail(teacherEmail);
    try {
      await rejectTeacher({ teacherEmail });
      await loadPending();
      await loadAll();
    } catch (e) {
      setListErr(e.message || "Từ chối thất bại.");
    } finally {
      setActionEmail(null);
    }
  }

  return (
    <div className="admin-page">
      <main className="admin-page__main admin-page__main--wide">

        <section className="admin-card admin-card--teachers" aria-labelledby="admin-teachers-heading">
          <div className="admin-card__head">
            <span className="admin-card__pill">Giáo viên</span>
            <h2 id="admin-teachers-heading" className="admin-card__title">
              Phê duyệt tài khoản giáo viên
            </h2>
          </div>
          <p className="admin-card__desc">
            Giáo viên đăng ký bằng email trên hệ thống sẽ ở trạng thái <strong>Chờ duyệt</strong> cho đến khi bạn duyệt.
          </p>

          {listErr ? (
            <p className="admin-page__err" role="alert">
              {listErr}
            </p>
          ) : null}

          <div className="admin-actions">
            <button type="button" className="admin-btn admin-btn--primary" disabled={loadingPending} onClick={loadPending}>
              {loadingPending ? "Đang tải…" : "Làm mới chờ duyệt"}
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" disabled={loadingAll} onClick={loadAll}>
              {loadingAll ? "Đang tải…" : "Làm mới tất cả"}
            </button>
          </div>

          {pendingFetchDone && pending.length === 0 ? (
            <p className="admin-page__info" role="status">
              Hiện <strong>không có</strong> tài khoản giáo viên nào đang chờ duyệt.
            </p>
          ) : null}

          {pending.length > 0 ? (
            <div className="admin-table-wrap">
              <h3 className="admin-subtitle">Chờ duyệt ({pending.length})</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Tên</th>
                    <th>Đăng ký</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pending.map((t) => (
                    <tr key={t.email}>
                      <td>{t.email}</td>
                      <td>{t.name || "—"}</td>
                      <td>{formatDate(t.createdAt)}</td>
                      <td className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--primary"
                          disabled={actionEmail === t.email}
                          onClick={() => handleApprove(t.email)}
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--danger"
                          disabled={actionEmail === t.email}
                          onClick={() => handleReject(t.email)}
                        >
                          Từ chối
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {allTeachers.length > 0 ? (
            <div className="admin-table-wrap">
              <h3 className="admin-subtitle">Tất cả giáo viên ({allTeachers.length})</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Tên</th>
                    <th>Mã GV</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {allTeachers.map((t) => {
                    const st = t.teacherApprovalStatus || "approved";
                    return (
                      <tr key={t.email}>
                        <td>{t.email}</td>
                        <td>{t.name || "—"}</td>
                        <td>
                          {t.teacherCode ? <code className="admin-code">{t.teacherCode}</code> : <span className="admin-muted">—</span>}
                        </td>
                        <td>
                          <span className={`admin-badge admin-badge--${st}`}>{statusLabel(st)}</span>
                        </td>
                        <td>{formatDate(t.updatedAt)}</td>
                        <td className="admin-table__actions">
                          {st === "pending" ? (
                            <>
                              <button
                                type="button"
                                className="admin-btn admin-btn--sm admin-btn--primary"
                                disabled={actionEmail === t.email}
                                onClick={() => handleApprove(t.email)}
                              >
                                Duyệt
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn--sm admin-btn--danger"
                                disabled={actionEmail === t.email}
                                onClick={() => handleReject(t.email)}
                              >
                                Từ chối
                              </button>
                            </>
                          ) : st === "rejected" ? (
                            <button
                              type="button"
                              className="admin-btn admin-btn--sm admin-btn--primary"
                              disabled={actionEmail === t.email}
                              onClick={() => handleApprove(t.email)}
                            >
                              Duyệt lại
                            </button>
                          ) : (
                            <span className="admin-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

      </main>
    </div>
  );
}
