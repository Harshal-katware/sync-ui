import bgImage from "../assets/restro.jpg"; // apni image yaha daal

export default function Login() {
  return (
    <div className="min-h-screen flex">
      
      {/*Left Image Section */}
      <div
        className="w-1/2 bg-cover bg-center hidden md:block"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>

      {/*Right Login Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#f5f1ea]">
        
        <div className="w-full max-w-sm p-8">
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            CREATE ACCOUNT
          </h1>

          {/* Input Fields */}
          <div className="space-y-4">
            <input
              type="email"
              placeholder="E-mail"
              className="w-full px-4 py-3 rounded-full bg-gray-200 outline-none"
            />

            <input
              type="password"
              placeholder="password"
              className="w-full px-4 py-3 rounded-full bg-gray-200 outline-none"
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right mt-2 text-sm text-green-600 cursor-pointer">
            forgot password?
          </div>

          {/* Login Button */}
          <button className="w-full mt-4 bg-green-500 text-white py-3 rounded-full hover:bg-green-600 transition">
            Login
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">Continua With</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 border rounded-full py-2 flex items-center justify-center gap-2 hover:bg-gray-100">
              <img
                src="https://img.icons8.com/color/16/google-logo.png"
                alt="google"
              />
              Google
            </button>

            <button className="flex-1 border rounded-full py-2 flex items-center justify-center gap-2 hover:bg-gray-100">
              <img
                src="https://img.icons8.com/color/16/facebook-new.png"
                alt="fb"
              />
              Facebook
            </button>
          </div>

          {/* Signup */}
          <p className="text-center text-sm text-gray-600 mt-6">
            {" "}
            <span className="text-green-600 cursor-pointer">
                Create an account
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}