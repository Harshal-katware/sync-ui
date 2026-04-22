import type { JSX } from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  to?: string;
}

export default function BackButton({ to }: BackButtonProps): JSX.Element {
  const navigate = useNavigate();

  const handleBack = (): void => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
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
