import "./StudentPlaceholder.css";

export default function StudentPlaceholder({ title, description }) {
  return (
    <div className="sp">
      <h1 className="sp__title">{title}</h1>
      <p className="sp__text">{description || "Nội dung đang được hoàn thiện."}</p>
    </div>
  );
}
