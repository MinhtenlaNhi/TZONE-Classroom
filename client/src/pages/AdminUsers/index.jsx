import { useEffect, useState } from "react";
import { fetchAdminUsers, toggleBlockUser, changeUserRole, createUser, updateUser } from "../../api/adminApi";
import { toast } from "react-toastify";
import "./AdminUsers.css";
import { apiPath } from "../../api/base";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [formData, setFormData] = useState({ id: "", name: "", email: "", password: "", role: "student" });

  useEffect(() => {
    // Delay slightly to prevent too many API calls while typing
    const delayDebounceFn = setTimeout(() => {
      loadUsers();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search, role, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminUsers(page, search, role);
      if (res.success) {
        setUsers(res.users);
        setTotalPages(res.totalPages);
        setTotalUsers(res.total);
      } else {
        toast.error("Lỗi lấy danh sách user");
      }
    } catch (e) {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId, currentStatus) => {
    const action = currentStatus ? "Mở khóa" : "Khóa";
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) return;

    try {
      const res = await toggleBlockUser(userId);
      if (res.success) {
        toast.success(res.message);
        setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: res.isBlocked } : u));
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleChangeRole = async (userId, newRole, currentRole) => {
    if (newRole === currentRole) return;
    if (!window.confirm(`Bạn có chắc muốn đổi vai trò của user này thành ${roleText(newRole)}?`)) return;

    try {
      const res = await changeUserRole(userId, newRole);
      
      if (res.success) {
        toast.success(res.message);
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Lỗi đổi vai trò");
    }
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setFormData({ id: "", name: "", email: "", password: "", role: "student" });
    setShowModal(true);
  };

  const handleOpenEdit = (user) => {
    setModalMode("edit");
    setFormData({ id: user._id, name: user.name, email: user.email, password: "", role: user.role || "student" });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        const res = await createUser(formData);
        if (res.success) {
          toast.success("Thêm người dùng thành công");
          setShowModal(false);
          loadUsers();
        } else {
          toast.error(res.message || "Lỗi khi thêm người dùng");
        }
      } else {
        const res = await updateUser(formData.id, formData);
        if (res.success) {
          toast.success("Cập nhật người dùng thành công");
          setShowModal(false);
          loadUsers();
        } else {
          toast.error(res.message || "Lỗi khi cập nhật người dùng");
        }
      }
    } catch (err) {
      toast.error("Lỗi máy chủ");
    }
  };

  // Calculate stats from current loaded users (approximation if paginated)
  const studentCount = users.filter(u => u.role === "student" || !u.role).length;
  const teacherCount = users.filter(u => u.role === "teacher").length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const currentTotal = users.length || 1; // avoid div by zero

  const roleText = (r) => {
    switch(r) {
      case "admin": return "Quản trị viên";
      case "operation": return "Bộ phận vận hành";
      case "teacher": return "Giảng viên";
      default: return "Học viên";
    }
  };

  return (
    <div className="tz-admin-users">
      {/* Header Section */}
      <div className="tz-users-header-container">
        <div className="tz-users-header-left">
          <div className="tz-users-header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>
          </div>
          <div>
            <h2>Quản lý Người dùng</h2>
            <p>Tổng cộng: {totalUsers} người dùng</p>
          </div>
        </div>
        
        <div className="tz-users-toolbar">
          <div className="tz-search-wrapper">
            <svg className="tz-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Tìm theo email hoặc tên..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="tz-filter-wrapper">
            <svg className="tz-filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            <select 
              value={role} 
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
            >
              <option value="">Tất cả vai trò</option>
              <option value="student">Học viên</option>
              <option value="teacher">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
              <option value="operation">Bộ phận vận hành</option>
            </select>
          </div>
          <button className="tz-btn-add-user" onClick={handleOpenAdd}>
            + Thêm người dùng
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="tz-users-stats">
        <div className="tz-user-stat-card">
          <div className="tz-user-stat-icon bg-mint">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#10b981"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>
          </div>
          <div className="tz-user-stat-info">
            <h3>{totalUsers}</h3>
            <p className="tz-stat-title">Tổng người dùng</p>
            <p className="tz-stat-subtitle">Toàn hệ thống</p>
          </div>
        </div>

        <div className="tz-user-stat-card">
          <div className="tz-user-stat-icon bg-blue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"></path></svg>
          </div>
          <div className="tz-user-stat-info">
            <h3>{studentCount}</h3>
            <p className="tz-stat-title">Học viên</p>
            <p className="tz-stat-subtitle">{Math.round((studentCount/currentTotal)*100)}% tổng số</p>
          </div>
        </div>

        <div className="tz-user-stat-card">
          <div className="tz-user-stat-icon bg-orange">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
          </div>
          <div className="tz-user-stat-info">
            <h3>{teacherCount}</h3>
            <p className="tz-stat-title">Giảng viên</p>
            <p className="tz-stat-subtitle">{Math.round((teacherCount/currentTotal)*100)}% tổng số</p>
          </div>
        </div>

        <div className="tz-user-stat-card">
          <div className="tz-user-stat-icon bg-purple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#a855f7"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"></path></svg>
          </div>
          <div className="tz-user-stat-info">
            <h3>{adminCount}</h3>
            <p className="tz-stat-title">Quản trị viên</p>
            <p className="tz-stat-subtitle">{Math.round((adminCount/currentTotal)*100)}% tổng số</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="tz-users-table-container">
        <table className="tz-users-table">
          <thead>
            <tr>
              <th>Người dùng <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th>Vai trò <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th>Trạng thái <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th>Ngày tham gia <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-4">Đang tải dữ liệu...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4">Không tìm thấy người dùng phù hợp.</td></tr>
            ) : (
              users.map(user => {
                const isStudent = user.role === "student" || !user.role;
                const isTeacher = user.role === "teacher";
                const isAdmin = user.role === "admin";
                
                // Get initials for fallback avatar
                const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
                
                return (
                  <tr key={user._id}>
                    <td>
                      <div className="tz-user-profile">
                        {user.avatar ? (
                          <img src={`${apiPath(user.avatar)}`} alt="avatar" className="tz-avatar-img" />
                        ) : (
                          <div className={`tz-avatar-initials ${isStudent ? 'bg-blue-light' : isTeacher ? 'bg-orange-light' : 'bg-purple-light'}`}>
                            {initials}
                          </div>
                        )}
                        <div className="tz-user-names">
                          <strong>{user.name || "Chưa cập nhật"}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className={`tz-role-select ${isStudent ? 'role-student' : isTeacher ? 'role-teacher' : 'role-admin'}`}
                        value={user.role || "student"}
                        onChange={(e) => handleChangeRole(user._id, e.target.value, user.role || "student")}
                      >
                        <option value="student">Học viên</option>
                        <option value="teacher">Giảng viên</option>
                        <option value="admin">Quản trị viên</option>
                        <option value="operation">Bộ phận vận hành</option>
                      </select>
                    </td>
                    <td>
                      <div className="tz-status">
                        <span className={`tz-status-dot ${user.isBlocked ? 'bg-red' : 'bg-green'}`}></span>
                        <span className={user.isBlocked ? 'text-red' : 'text-green'}>
                          {user.isBlocked ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'}
                        </span>
                      </div>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td className="text-right">
                      <div className="tz-actions">
                        <button className="tz-btn-icon tz-btn-edit" title="Chỉnh sửa" onClick={() => handleOpenEdit(user)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button 
                          className="tz-btn-icon tz-btn-delete" 
                          onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                          disabled={user.role === "admin"}
                          title={user.role === "admin" ? "Không thể khóa Admin" : (user.isBlocked ? "Mở khóa" : "Khóa")}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      {totalPages > 0 && (
        <div className="tz-pagination-container">
          <div className="tz-pagination">
            <button 
              className="tz-page-btn tz-page-arrow"
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button className="tz-page-btn tz-page-active">{page}</button>
            {page < totalPages && <button className="tz-page-btn" onClick={() => setPage(page + 1)}>{page + 1}</button>}
            <button 
              className="tz-page-btn tz-page-arrow"
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
          
          <div className="tz-items-per-page">
            <select disabled>
              <option>20 / trang</option>
            </select>
          </div>
        </div>
      )}

      {/* Modal User */}
      {showModal && (
        <div className="tz-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tz-modal-content" onClick={e => e.stopPropagation()}>
            <div className="tz-modal-header">
              <h3>{modalMode === "add" ? "Thêm người dùng mới" : "Sửa người dùng"}</h3>
              <button className="tz-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="tz-modal-form">
              <div className="tz-form-group">
                <label>Họ và tên <span className="text-red">*</span></label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                  placeholder="Nhập họ tên"
                />
              </div>
              <div className="tz-form-group">
                <label>Email <span className="text-red">*</span></label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required 
                  placeholder="Nhập địa chỉ email"
                />
              </div>
              <div className="tz-form-group">
                <label>Mật khẩu {modalMode === "add" && <span className="text-red">*</span>}</label>
                <input 
                  type="password" 
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  required={modalMode === "add"}
                  placeholder={modalMode === "add" ? "Nhập mật khẩu" : "Nhập mật khẩu mới (nếu muốn đổi)"}
                />
              </div>
              <div className="tz-form-group">
                <label>Vai trò</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="student">Học viên</option>
                  <option value="teacher">Giảng viên</option>
                  <option value="admin">Quản trị viên</option>
                  <option value="operation">Bộ phận vận hành</option>
                </select>
              </div>
              <div className="tz-modal-footer">
                <button type="button" className="tz-btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="tz-btn-submit">
                  {modalMode === "add" ? "Thêm người dùng" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
