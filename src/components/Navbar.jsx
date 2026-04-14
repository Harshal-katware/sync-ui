import { useState } from "react";
import { User, Settings } from "lucide-react";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="w-full  bg-white/5 backdrop-blur-sm px-4 sm:px-8 py-4 flex items-center justify-between gap-3 text-[#b2d1df]">
      
      {/* Left Side */}
      <h1 className="text-xl font-serif text-gray-100">
        🍽️ Sync Restaurant
      </h1>

      {/* Right Side */}
      <div className="flex items-center gap-4 relative">
        
        {/* ⚙️ Settings */}
        <div className="relative">
          <div
            onClick={() => toggleMenu("settings")}
            className="p-2 rounded-full hover:bg-gray-800 cursor-pointer"
          >
            <Settings size={20} />
          </div>

          {openMenu === "settings" && (
            <div className="absolute right-0 mt-2 w-48 
              bg-white/10 backdrop-blur-md border border-white/20 
              rounded-lg shadow-lg z-50 text-white"
            >
              <p className="px-4 py-2 hover:bg-white/20 cursor-pointer">
                Restaurant Info
              </p>
              
              <p className="px-4 py-2 hover:bg-white/20 cursor-pointer">
                Staff Management
              </p>
            </div>
          )}
        </div>

        {/* 👤 Account */}
        <div className="relative">
          <div
            onClick={() => toggleMenu("account")}
            className="p-2 rounded-full hover:bg-gray-800 cursor-pointer"
          >
            <User size={20} />
          </div>

          {openMenu === "account" && (
            <div className="absolute right-0 mt-2 w-48 
              bg-white/10 backdrop-blur-md border border-white/20 
              rounded-lg shadow-lg z-50 text-white"
            >
              <p className="px-4 py-2 hover:bg-white/20 cursor-pointer">
                Profile
              </p>
              <p className="px-4 py-2 hover:bg-white/20 cursor-pointer">
                Change Password
              </p>
              <p className="px-4 py-2 hover:bg-white/20 cursor-pointer">
                Logout
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}