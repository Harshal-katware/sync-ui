
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ADDED
import Navbar from "../components/Navbar";
import restroImage from "../assets/restro4.jpg";

export default function Dashboard() {
  const [selected, setSelected] = useState("");
  const navigate = useNavigate(); // ADDED

  const navCards = [
    { title: "Billing", icon: "🧾", path: "/billing" },
    { title: "Menu", icon: "🍽️", path: "/menu" },
    { title: "Inventory", icon: "📦", path: "/inventory" },
    { title: "Reports", icon: "📊", path: "/reports" },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${restroImage})` }}
    >
      <Navbar />

      <div className="p-8 ">
        <div className="grid grid-cols-1 gap-4 ">
          {navCards.map((card) => (
            <div
              key={card.title}
              onClick={() => {
                setSelected(card.title);
                navigate(card.path); // ADDED
              }}
              className="rounded-xl p-5 cursor-pointer hover:shadow-md bg-white/50 w-3xl"
            >
              <div className="flex text-2xl mb-3">
                <span className="text-xl gap-2"> {card.icon} </span>
                <p className="font-bold font-sans text-2xl">{card.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}