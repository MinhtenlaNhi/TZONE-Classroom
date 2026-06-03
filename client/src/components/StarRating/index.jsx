import "./StarRating.css";

export default function StarRating({ rating, setRating, interactive = false, maxStars = 5 }) {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= rating;
    stars.push(
      <span 
        key={i} 
        className={`star ${isFilled ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
        onClick={() => interactive && setRating(i)}
      >
        ★
      </span>
    );
  }

  return <div className="star-rating">{stars}</div>;
}
