import { Link } from "react-router-dom";
import UserNavMenu from "./UserNavMenu";

export default function CoursePageHeader() {
  return (
    <header className="tap-su-page__top tap-su-page__top--bar">
      <div className="tap-su-page__top-left">
        <Link className="tap-su-page__back" to="/">
          ← Trang chủ
        </Link>
        <h1 className="tap-su-page__logo">
          <Link to="/">TZone</Link>
        </h1>
      </div>
      <UserNavMenu />
    </header>
  );
}
