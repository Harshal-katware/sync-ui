import {
    useState,
    type ChangeEvent,
    type JSX,
} from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import bg from "../assets/restro4.jpg";
import logo from "../assets/chef2.jpg";

interface FormState {
    email: string;
}

export default function ForgotPassword(): JSX.Element {
    const navigate = useNavigate();

    const [form, setForm] = useState<FormState>({
        email: "",
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

    const validateEmail = (): boolean => {
        const email = form.email.trim();

        if (!email) {
            setError("Email is required");
            return false;
        }

        const emailRegex =
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!emailRegex.test(email)) {
            setError("Enter valid email address");
            return false;
        }

        return true;
    };

    const handleSubmit = async (): Promise<void> => {
        setError("");
        setSuccess("");

        if (!validateEmail()) return;

        try {
            setLoading(true);

            const res = await axios.post(
                "http://localhost:8080/api/auth/forgot-password",
                {
                    email: form.email.trim(),
                },
            );

            setSuccess(
                res.data ||
                "Reset password link sent to your email",
            );

            setForm({
                email: "",
            });
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
                    Forgot Password
                </h1>

                <p className="text-sm text-white/70 mb-6">
                    Enter your registered email address
                </p>

                <div className="space-y-4 text-left">
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-white/50 rounded bg-transparent focus:outline-none focus:border-white"
                        />

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
                        ? "Sending..."
                        : "Send Reset Link"}
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