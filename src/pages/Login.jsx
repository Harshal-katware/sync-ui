import { useState } from "react";
import bg from "../assets/restro4.jpg";
import logo from "../assets/chef2.jpg";
import { Eye, EyeOff } from "lucide-react";
export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [remember, setRemember] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState({});

  //  Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //  Validation
  const validate = () => {
  let err = {};

  const name = form.name.trim();
  const email = form.email.trim();
  const password = form.password.trim();
  const confirm = form.confirm.trim();

  // Name
  if (!isLogin) {
    if (!name) err.name = "Name is required";
    else if (name.length < 3)
      err.name = "Minimum 3 characters required";
  }

  // Email
  if (!email) err.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    err.email = "Enter valid email (example@gmail.com)";

  //  Password (Strong validation)
  if (!password) err.password = "Password is required";
  else if (password.length < 6)
    err.password = "Minimum 6 characters required";
  else if (!/[A-Z]/.test(password))
    err.password = "At least 1 uppercase letter required";
  else if (!/[0-9]/.test(password))
    err.password = "At least 1 number required";

  //  Confirm Password
  if (!isLogin) {
    if (!confirm) err.confirm = "Confirm password required";
    else if (confirm !== password)
      err.confirm = "Passwords do not match";
  }

  return err;
};

  //  Submit
  const handleSubmit = () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      alert(isLogin ? "Login Success ✅" : "Signup Success ✅");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 w-full max-w-md p-8 text-white text-center">
        
        {/* Logo */}
        <div className="mb-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center">
            <img
              src={logo}
              alt="logo"
              className="w-20 h-20 object-cover rounded-full"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl mb-6">
          {isLogin ? "Login to Continue" : "Create Account"}
        </h1>

        {/* Inputs */}
        <div className="space-y-4 text-left">

          {!isLogin && (
            <div>
              <label className="text-sm">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter name"
                onChange={handleChange}
                className="w-full mt-1 px-4 py-2 bg-transparent border border-gray-400 rounded"
              />
              {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="text-sm">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="abc@xyz.com"
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 bg-transparent border border-gray-400 rounded"
            />
            {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
          </div>

         <div className="relative">
           <label className="text-sm">Password</label>

           <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="********"
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 bg-transparent border border-gray-400 rounded pr-10"
           />

           <span
             onClick={() => setShowPassword(!showPassword)}
             className="absolute right-3 top-9 cursor-pointer text-gray-300 hover:text-white"
           >
             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
           </span>

           {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
            )}
         </div>

        {!isLogin && (
          <div className="relative">
            <label className="text-sm">Confirm Password</label>

           <input
               type={showConfirm ? "text" : "password"}
               name="confirm"
               placeholder="Confirm password"
               onChange={handleChange}
               className="w-full mt-1 px-4 py-2 bg-transparent border border-gray-400 rounded pr-10"
           />

           <span
               onClick={() => setShowConfirm(!showConfirm)}
               className="absolute right-3 top-9 cursor-pointer text-gray-300 hover:text-white">
               {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
           </span>

            {errors.confirm && (
             <p className="text-red-400 text-sm">{errors.confirm}</p>
             )}
         </div>
          )}
      </div>

        {/* Options */}
        {isLogin && (
          <div className="flex justify-between text-sm mt-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
              />
              Remember Me
            </label>

            <span
              onClick={() => alert("Reset password feature coming soon")}
              className="underline cursor-pointer"
            >
              Forgot Password
            </span>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          className="w-full mt-5 bg-white text-black py-2 rounded font-semibold"
        >
          {isLogin ? "SIGN IN" : "SIGN UP"}
        </button>

        {/* Switch */}
        <p className="mt-4 text-sm">
          {isLogin ? "New User?" : "Already have account?"}{" "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="text-blue-400 cursor-pointer"
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>

      </div>
    </div>
  );
}