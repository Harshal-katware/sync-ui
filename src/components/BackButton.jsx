import { useNavigate } from "react-router-dom";

export default function BackButton({ to }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to); // go to specific route
    } else {
      navigate(-1); // go to previous page
    }
  };

  return (
    <button
      onClick={handleBack}
      className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
    >
      ⬅ Back
    </button>
  );
}
