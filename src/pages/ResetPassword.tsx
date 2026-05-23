import {
    useState,
    type ChangeEvent,
    type JSX,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import axios from "axios";

import bg from "../assets/restro4.jpg";
import logo from "../assets/chef2.jpg";

import { Eye, EyeOff } from "lucide-react";

interface FormState {
    password: string;
    confirmPassword: string;
}

export default function ResetPassword(): JSX.Element {
    const navigate = useNavigate();

    const { token } = useParams();

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirm, setShowConfirm] =
        useState(false);

    const [form, setForm] = useState<FormState>({
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement>,
    ): void => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

        setError("");
        setSuccess("");
    };

    const validatePassword = (): boolean => {
        if (!form.password) {
            setError("Password is required");
            return false;
        }

        if (form.password.length < 8) {
            setError(
                "Password must be at least 8 characters",
            );
            return false;
        }

        if (!/[A-Z]/.test(form.password)) {
            setError(
                "At least one uppercase letter required",
            );
            return false;
        }

        if (!/[a-z]/.test(form.password)) {
            setError(
                "At least one lowercase letter required",
            );
            return false;
        }

        if (!/[0-9]/.test(form.password)) {
            setError("At least one number required");
            return false;
        }

        if (
            !/[!@#$%^&*(),.?":{}|<>]/.test(
                form.password,
            )
        ) {
            setError(
                "At least one special character required",
            );
            return false;
        }

        if (
            form.password !== form.confirmPassword
        ) {
            setError("Passwords do not match");
            return false;
        }

        return true;
    };

    const handleSubmit = async (): Promise<void> => {
        setError("");
        setSuccess("");

        if (!validatePassword()) return;

        try {
            setLoading(true);

            const res = await axios.post(
                `http://localhost:8080/api/auth/reset-password/${token}`,
                {
                    password: form.password,
                },
            );

            setSuccess(
                res.data || "Password updated successfully",
            );

            setTimeout(() => {
                navigate("/");
            }, 2000);
        } catch (err: any) {
            setError(
                err?.response?.data?.error ||
                err?.response?.data ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <div className="absolute inset-0 bg-black/60" />

            <div className="relative z-10 w-full max-w-md p-8 text-white text-center">
                <img
                    src={logo}
                    className="w-20 h-20 mx-auto rounded-full mb-4"
                    alt="logo"
                />

                <h1 className="text-2xl mb-2">
                    Reset Password
                </h1>

                <p className="text-sm text-white/70 mb-6">
                    Create your new password
                </p>

                <div className="space-y-4 text-left">
                    {/* Password */}
                    <div>
                        <div className="relative">
                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="New Password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-white/50 rounded bg-transparent focus:outline-none focus:border-white pr-10"
                            />

                            <span
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword,
                                    )
                                }
                                className="absolute right-3 top-2.5 cursor-pointer text-white/70 hover:text-white"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <div className="relative">
                            <input
                                type={
                                    showConfirm
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-white/50 rounded bg-transparent focus:outline-none focus:border-white pr-10"
                            />

                            <span
                                onClick={() =>
                                    setShowConfirm(!showConfirm)
                                }
                                className="absolute right-3 top-2.5 cursor-pointer text-white/70 hover:text-white"
                            >
                                {showConfirm ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </span>
                        </div>

                        {error && (
                            <p className="text-red-400 text-xs mt-1 ml-1">
                                ⚠ {error}
                            </p>
                        )}

                        {success && (
                            <p className="text-green-400 text-xs mt-1 ml-1">
                                ✓ {success}
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full mt-5 bg-white text-black py-2 rounded font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    {loading
                        ? "Updating..."
                        : "Update Password"}
                </button>

                <p className="mt-4 text-sm">
                    Back to Login

                    <span
                        onClick={() => navigate("/")}
                        className="text-blue-400 cursor-pointer ml-2 hover:underline"
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}