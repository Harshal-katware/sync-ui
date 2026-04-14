// import { useNavigate } from "react-router-dom";
// import Navbar from "../components/Navbar";
// import restroImage from "../assets/restro4.jpg";

// export default function Dashboard() {
//   const navigate = useNavigate();

//   const navCards = [
//     { title: "Billing", icon: "🧾", path: "/billing" },
//     { title: "Menu", icon: "🍽️", path: "/menu" },
//     { title: "Inventory", icon: "📦", path: "/inventory" },
//     { title: "Reports", icon: "📊", path: "/reports" },
//   ];

//   return (
//     <div
//       className="min-h-screen bg-cover bg-center bg-no-repeat"
//       style={{ backgroundImage: `url(${restroImage})` }}
//     >
//       <Navbar />

//       <div className="p-8">
//         <div className="grid grid-cols-1 gap-4">
//           {navCards.map((card) => (
//             <div
//               key={card.title}
//               onClick={() => navigate(card.path)}   // 🔥 navigation
//               className="rounded-xl p-5 cursor-pointer hover:shadow-md bg-white/50 w-3xl"
//             >
//               <div className="flex items-center gap-3">
//                 <span className="text-xl">{card.icon}</span>
//                 <p className="font-bold text-2xl">{card.title}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import restroImage from "../assets/restro4.jpg";

export default function Dashboard() {
  const navigate = useNavigate();

  const navCards = [
    { title: "Billing", desc: "Manage orders easily", icon: "🧾", path: "/billing" },
    { title: "Menu", desc: "Update food items", icon: "🍽️", path: "/menu" },
    { title: "Inventory", desc: "Track stock", icon: "📦", path: "/inventory" },
    { title: "Reports", desc: "View analytics", icon: "📊", path: "/reports" },
  ];

  return (
    <div className="min-h-screen relative">
      
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${restroImage})` }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/20"></div>

      {/* Content */}
      <div className="relative z-10">
        
        <Navbar />

        <div className="p-8 max-w-5xl">
          
          {/* Heading */}
          <div className="mb-8 text-white">
            <h1 className="text-3xl font-bold">Welcome Rushi 👋</h1>
            <p className="text-sm opacity-80">
              Manage your restaurant efficiently
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 gap-6">
            {navCards.map((card) => (
              <div
                key={card.title}
                onClick={() => navigate(card.path)}   // 🔥 routing here
                className="bg-white/20 backdrop-blur-lg border border-white/30 
                rounded-2xl p-6 cursor-pointer 
                hover:scale-[1.03] hover:shadow-2xl 
                transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{card.icon}</span>
                  <p className="text-lg font-semibold text-white">
                    {card.title}
                  </p>
                </div>

                <p className="text-sm text-gray-200 mt-2">
                  {card.desc}
                </p>

                <p className="text-xs text-gray-300 mt-3">
                  Click to manage →
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}