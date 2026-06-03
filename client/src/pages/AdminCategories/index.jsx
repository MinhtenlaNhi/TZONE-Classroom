import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory
} from "../../api/adminCategories";
import { getAuth } from "../../auth/auth";
import "./AdminCategories.css";

export default function AdminCategoriesPage() {
  const auth = getAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Fake pagination state for UI completeness
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    order: 0,
    isActive: true
  });

  if (!auth || (auth.role !== "admin" && auth.role !== "operation")) {
    return <Navigate to="/" replace />;
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAdminCategories();
      if (res.success) {
        setCategories(res.categories || []);
      } else {
        toast.error(res.message || "Lỗi tải danh mục");
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingId(category._id);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        order: category.order || 0,
        isActive: category.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        order: 0,
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Tự động tạo slug từ name
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData(prev => {
      if (!editingId && (!prev.slug || prev.slug === createSlug(prev.name))) {
        return { ...prev, name: val, slug: createSlug(val) };
      }
      return { ...prev, name: val };
    });
  };

  const createSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Tên và Slug là bắt buộc");
      return;
    }

    try {
      let res;
      if (editingId) {
        res = await updateAdminCategory(editingId, formData);
      } else {
        res = await createAdminCategory(formData);
      }

      if (res.success) {
        toast.success(res.message);
        handleCloseModal();
        loadData();
      } else {
        toast.error(res.message || "Lỗi lưu danh mục");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) return;
    
    try {
      const res = await deleteAdminCategory(id);
      if (res.success) {
        toast.success("Đã xóa danh mục");
        loadData();
      } else {
        toast.error(res.message || "Không thể xóa danh mục");
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ");
    }
  };
  
  // Helper to generate a 2-letter initials from name
  const getInitials = (name) => {
    if (!name) return "NA";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // Helper to get a stable color class based on category name
  const getColorClass = (name) => {
    const sum = (name || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const classes = ['bg-cat-green', 'bg-cat-blue', 'bg-cat-purple', 'bg-cat-orange', 'bg-cat-yellow'];
    return classes[sum % classes.length];
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã copy slug: " + text);
  };

  return (
    <div className="tz-admin-cats">
      <header className="tz-cats-header">
        <div className="tz-cats-header-left">
          <h2>Quản lý Danh mục</h2>
          <p>Quản lý các danh mục khóa học trong hệ thống</p>
        </div>
        <button className="tz-btn-add-cat" onClick={() => handleOpenModal()}>
          + Thêm Danh mục
        </button>
      </header>

      <div className="tz-cats-table-container">
        <table className="tz-cats-table">
          <thead>
            <tr>
              <th>Thứ tự <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th>Tên danh mục <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th>Slug <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th>Trạng thái <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg></th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-4">Đang tải dữ liệu...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4">Chưa có danh mục nào</td></tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat._id}>
                  <td>
                    <div className="tz-cat-order-badge">
                      {cat.order !== undefined ? cat.order : index}
                    </div>
                  </td>
                  <td>
                    <div className="tz-cat-name-cell">
                      <div className={`tz-cat-logo ${getColorClass(cat.name)}`}>
                        {getInitials(cat.name)}
                      </div>
                      <div className="tz-cat-name-info">
                        <strong>{cat.name}</strong>
                        <span>Danh mục khóa học</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="tz-cat-slug-badge" onClick={() => copyToClipboard(cat.slug)}>
                      {cat.slug} 
                      <svg className="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </div>
                  </td>
                  <td>
                    <div className="tz-cat-status">
                      {cat.isActive ? (
                        <div className="tz-status-badge status-active">
                          <span className="dot"></span> Hiển thị
                        </div>
                      ) : (
                        <div className="tz-status-badge status-inactive">
                          <span className="dot"></span> Ẩn
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="tz-cat-actions">
                      <button className="tz-btn-action btn-action-edit" onClick={() => handleOpenModal(cat)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Sửa
                      </button>
                      <button className="tz-btn-action btn-action-delete" onClick={() => handleDelete(cat._id, cat.name)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Footer / Pagination */}
        {!loading && categories.length > 0 && (
          <div className="tz-cats-footer">
            <div className="tz-cats-showing">
              Hiển thị 1 - {categories.length} trong {categories.length} danh mục
            </div>
            <div className="tz-pagination-container">
              <div className="tz-pagination">
                <button className="tz-page-btn tz-page-arrow" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button className="tz-page-btn tz-page-active">1</button>
                <button className="tz-page-btn tz-page-arrow" disabled>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
              <div className="tz-items-per-page">
                <select disabled>
                  <option>10 / trang</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm / Sửa */}
      {showModal && (
        <div className="admin-cats__modal-overlay">
          <div className="admin-cats__modal">
            <h2>{editingId ? "Sửa Danh mục" : "Thêm Danh mục mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="tz-form-group">
                <label>Tên danh mục <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleNameChange} 
                  required 
                  placeholder="Ví dụ: TOEIC A"
                />
              </div>
              
              <div className="tz-form-group">
                <label>Slug (URL) <span className="text-danger">*</span></label>
                <input 
                  type="text" 
                  name="slug" 
                  value={formData.slug} 
                  onChange={handleChange} 
                  required 
                  placeholder="vi-du-toeic-a"
                />
                <small style={{display: 'block', marginTop: '0.25rem', color: '#94a3b8', fontSize: '0.8rem'}}>Chỉ dùng chữ thường, số và dấu gạch ngang (-)</small>
              </div>

              <div className="tz-form-group">
                <label>Mô tả ngắn</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows="3"
                  placeholder="Mô tả về đối tượng của danh mục khóa học này"
                ></textarea>
              </div>

              <div className="tz-form-row">
                <div className="tz-form-group">
                  <label>Thứ tự hiển thị (Order)</label>
                  <input 
                    type="number" 
                    name="order" 
                    value={formData.order} 
                    onChange={handleChange} 
                  />
                  <small style={{display: 'block', marginTop: '0.25rem', color: '#94a3b8', fontSize: '0.8rem'}}>Số nhỏ hiển thị trước</small>
                </div>

                <div className="tz-form-group checkbox-group" style={{marginTop: '0.5rem'}}>
                  <label>
                    <input 
                      type="checkbox" 
                      name="isActive" 
                      checked={formData.isActive} 
                      onChange={handleChange} 
                    />
                    <span>Kích hoạt (Hiển thị cho học viên)</span>
                  </label>
                </div>
              </div>

              <div className="admin-cats__modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="btn-save">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
