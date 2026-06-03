import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCategories } from "../../api/categories";
import { fetchCart } from "../../api/cartApi";
import { getAuth } from "../../auth/auth";
import UserNavMenu from "../UserNavMenu";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
);

export default function PublicHeader() {
  const navigate = useNavigate();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef(null);
  const auth = getAuth();

  useEffect(() => {
    fetchCategories().then(res => {
      if (res.success) setCategories(res.categories);
    });

    const loadCart = () => {
      if (getAuth()) {
        fetchCart().then(res => {
          if (res.success && res.cart) {
            setCartCount(res.cart.items.length);
          }
        });
      }
    };

    loadCart();
    window.addEventListener("cartUpdated", loadCart);

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchVal = e.target.search.value;
    if (searchVal.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchVal.trim())}`);
    } else {
      navigate(`/courses`);
    }
  };

  return (
    <header className="tz-home-header">
      <div className="tz-nav-container">
        <div className="tz-nav-left">
          <Link to="/" className="tz-logo">
            <span className="tz-logo-icon">TZ</span> TZONE
          </Link>
          <div className="tz-category-wrapper" ref={dropdownRef}>
            <button 
              className={`tz-btn-category ${isCategoryOpen ? 'active' : ''}`}
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <HamburgerIcon /> <span>Danh mục</span>
            </button>
            
            {isCategoryOpen && (
              <div className="tz-category-dropdown">
                <Link to="/courses" className="tz-dropdown-item tz-all-courses-item" onClick={() => setIsCategoryOpen(false)}>
                  Tất cả khóa học
                </Link>
                {categories.map(c => (
                  <Link 
                    key={c.id} 
                    to={`/courses?category=${c.id}`} 
                    className="tz-dropdown-item"
                    onClick={() => setIsCategoryOpen(false)}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="tz-nav-search">
          <form className="tz-search-pill" onSubmit={handleSearch}>
            <input type="text" name="search" placeholder="Tìm kiếm khóa học..." />
            <button type="submit"><SearchIcon /></button>
          </form>
        </div>

        <div className="tz-nav-right">
          <Link to="/cart" className="tz-btn-cart">
            <CartIcon />
            <span className="tz-cart-badge">{cartCount}</span>
          </Link>
          <UserNavMenu />
        </div>
      </div>
    </header>
  );
}
