import { useState, useEffect, type ChangeEvent, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bg from "../assets/restro4.jpg";
import logo from "../assets/chef2.jpg";
import { Eye, EyeOff } from "lucide-react";
 
interface FormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
  contactNumber: string;
}
 
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
  contactNumber?: string;
}
 
interface TouchedFields {
  name?: boolean;
  email?: boolean;
  password?: boolean;
  confirm?: boolean;
  contactNumber?: boolean;
}
 
export default function AuthPage(): JSX.Element {
  const navigate = useNavigate();
 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [remember, setRemember] = useState(false);
 
  const initialState: FormState = {
    name: "",
    email: "",
    password: "",
    confirm: "",
    contactNumber: "",
  };
 
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
 
  // AUTO LOGIN
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);
 
  // Field-level validate
  const validateField = (name: keyof FormState, value: string): string => {
    switch (name) {
      case "name":
        if (!isLogin) {
          if (!value.trim()) return "Full name is required";
          if (value.trim().length < 3) return "Minimum 3 characters required";
          if (!/^[a-zA-Z\s]+$/.test(value)) return "Only letters allowed";
        }
        return "";
 
       case "email":
        if (!value) return "Email or contact number is required";
        if (isLogin) {
          const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
          const isPhone = /^\d{10}$/.test(value);
          if (!isEmail && !isPhone) return "Enter valid email or 10-digit number";
        } else {
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))
            return "Enter a valid email (e.g. user@example.com)";
        }
        return "";
 
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Minimum 8 characters required";
        if (!/[A-Z]/.test(value)) return "At least one uppercase letter required";
        if (!/[0-9]/.test(value)) return "At least one number required";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "At least one special character required";
        return "";
 
      case "confirm":
        if (!isLogin) {
          if (!value) return "Please confirm your password";
          if (value !== form.password) return "Passwords do not match";
        }
        return "";
 
      case "contactNumber":
        if (!isLogin) {
          if (!value) return "Contact number is required";
          if (!/^\d{10}$/.test(value)) return "Enter valid 10-digit number";
        }
        return "";
 
      default:
        return "";
    }
  };
 
  // Full form validate
  const validateAll = (): FormErrors => {
    const fields: (keyof FormState)[] = isLogin
      ? ["email", "password"]
      : ["name", "email", "password", "confirm", "contactNumber"];
 
    const err: FormErrors = {};
    fields.forEach((field) => {
      const msg = validateField(field, form[field]);
      if (msg) err[field] = msg;
    });
    return err;
  };
 
  // onChange
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
 
    if (touched[name as keyof TouchedFields]) {
      const msg = validateField(name as keyof FormState, value);
      setErrors((prev) => ({ ...prev, [name]: msg }));
 
      if (name === "password" && touched.confirm) {
        const confirmMsg = updatedForm.confirm !== value ? "Passwords do not match" : "";
        setErrors((prev) => ({ ...prev, confirm: confirmMsg }));
      }
    }
  };
 
  // onBlur
  const handleBlur = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const msg = validateField(name as keyof FormState, value);
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };
 
  // Input class
  const inputClass = (field: keyof FormErrors): string => {
    const base = "w-full px-4 py-2 border rounded bg-transparent transition-colors duration-200";
    if (touched[field] && errors[field]) return `${base} border-red-500 focus:outline-none focus:border-red-400`;
    if (touched[field] && !errors[field]) return `${base} border-green-500 focus:outline-none focus:border-green-400`;
    return `${base} border-white/50 focus:outline-none focus:border-white`;
  };
 
  // SUBMIT
  const handleSubmit = async (): Promise<void> => {
    const allTouched: TouchedFields = {
      name: true, email: true, password: true, confirm: true, contactNumber: true,
    };
    setTouched(allTouched);
 
    const validationErrors = validateAll();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length !== 0) return;
 
    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:8080/api/auth/login", {
          email: form.email,
          password: form.password,
        });
 
        const { token, name, email, role, contactNumber } = res.data;
 
        if (remember) {
          localStorage.setItem("token", token);
          localStorage.setItem("userName", name);
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userRole", role);
          localStorage.setItem("userContact", contactNumber ?? "");
        } else {
          sessionStorage.setItem("token", token);
          sessionStorage.setItem("userName", name);
          sessionStorage.setItem("userEmail", email);
          sessionStorage.setItem("userRole", role);
          sessionStorage.setItem("userContact", contactNumber ?? "");
        }
        navigate("/dashboard");
 
      } else {
        await axios.post("http://localhost:8080/api/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          contactNumber: form.contactNumber,
        });
 
        setIsLogin(true);
      }
 
      setForm(initialState);
      setErrors({});
      setTouched({});
 
    } catch (err: any) {
      console.error(err);
      const status = err?.response?.status;
      //  Backend might send error message in different formats, so we try to handle common cases
      const serverMsg = err?.response?.data?.message ?? err?.response?.data;
 
      if (status === 401) {
        setErrors({ password: "Invalid email or password. Please try again." });
      } else if (status === 404) {
        setErrors({ email: "No account found with this email." });
      } else if (status === 409) {
        //  Email or contact already registered
        const msg = typeof serverMsg === "string" ? serverMsg : "Email or contact already registered.";
        if (msg.toLowerCase().includes("contact")) {
          setErrors({ contactNumber: msg });
        } else {
          setErrors({ email: msg });
        }
      } else {
        setErrors({ email: typeof serverMsg === "string" ? serverMsg : "Something went wrong. Please try again." });
      }
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
        <img src={logo} className="w-20 h-20 mx-auto rounded-full mb-4" alt="logo" />
 
        <h1 className="text-2xl mb-6">
          {isLogin ? "Login to Continue" : "Create Account"}
        </h1>
 
        <div className="space-y-4 text-left">
 
          {/* Name */}
          {!isLogin && (
            <div>
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={inputClass("name")}
              />
              {touched.name && errors.name && (
                <p className="text-red-400 text-xs mt-1 ml-1">⚠ {errors.name}</p>
              )}
            </div>
          )}
 
          {/* Email */}
          <div>
            <input
              name="email"
              placeholder="Email or Contact Number"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass("email")}
            />
            {touched.email && errors.email && (
              <p className="text-red-400 text-xs mt-1 ml-1">⚠ {errors.email}</p>
            )}
          </div>
 
          {/* Contact Number — only signup */}
          {!isLogin && (
            <div>
              <input
                name="contactNumber"
                placeholder="Contact Number (10 digits)"
                value={form.contactNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                maxLength={10}
                className={inputClass("contactNumber")}
              />
              {touched.contactNumber && errors.contactNumber && (
                <p className="text-red-400 text-xs mt-1 ml-1">⚠ {errors.contactNumber}</p>
              )}
            </div>
          )}
 
          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${inputClass("password")} pr-10`}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-white/70 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
            {touched.password && errors.password && (
              <p className="text-red-400 text-xs mt-1 ml-1">⚠ {errors.password}</p>
            )}
          </div>
 
          {/* Confirm Password */}
          {!isLogin && (
            <div>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm"
                  placeholder="Confirm Password"
                  value={form.confirm}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`${inputClass("confirm")} pr-10`}
                />
                <span
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 cursor-pointer text-white/70 hover:text-white"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              {touched.confirm && errors.confirm && (
                <p className="text-red-400 text-xs mt-1 ml-1">⚠ {errors.confirm}</p>
              )}
            </div>
          )}
 
        </div>
 
        {/* Remember Me */}
        {isLogin && (
          <label className="flex gap-2 mt-3 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} />
            Remember Me
          </label>
        )}
 
        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full mt-5 bg-white text-black py-2 rounded font-semibold hover:bg-gray-200 transition-colors"
        >
          {isLogin ? "SIGN IN" : "SIGN UP"}
        </button>
 
        {/* Switch */}
        <p className="mt-4 text-sm">
          {isLogin ? "New User?" : "Already have account?"}
          <span
            onClick={() => { setIsLogin(!isLogin); setForm(initialState); setErrors({}); setTouched({}); }}
            className="text-blue-400 cursor-pointer ml-2 hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}