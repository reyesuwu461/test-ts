import type { ActionFunctionArgs } from "react-router-dom";
import { Form, redirect, useActionData, useNavigation, Link } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import { login } from "../api";
import { Alert, AlertDescription, AlertTitle } from "../components/alert";
import { FormError } from "../components/form-error";
import { Input } from "../components/input";

export async function action({ request }: ActionFunctionArgs) {
  const errors: Record<string, string> = {};
  const formData = await request.formData();

  // Validate the form fields
  const email = formData.get("email") as string;
  if (email === "") {
    errors.email = "Email is required.";
  } else if (
    email.match(
      /^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i,
    ) === null
  ) {
    errors.email = "Please enter a valid email address.";
  }
  const password = formData.get("password") as string;
  if (password === "") {
    errors.password = "Password is required.";
  }

  // Do we have any errors?
  if (Object.keys(errors).length > 0) {
    return errors;
  }

  try {
    const session = await login(email, password);
    // Store the token
    Cookies.set("token", session.token);
    // Get the URL and look for a "to" search param
    const url = new URL(request.url);
    // Redirect
    return redirect(url.searchParams.get("to") ?? "/");
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return { form: "Invalid email or password." };
    }
    throw error;
  }
}

export function Component() {
  const error = useActionData() as Record<string, string> | undefined;
  const navigation = useNavigation();

  return (
    <Form method="post">
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Title */}
          <h1 className="text-center text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            TechNova Dashboard
          </h1>

          {/* Login Card */}
          <div className="bg-slate-700/50 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-slate-600/50">
            {/* Login Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-200">Login</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto mt-2"></div>
            </div>

            <div className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-slate-300 text-sm mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-purple-400" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    inputMode="email"
                    className="w-full bg-slate-600/50 border border-slate-500 rounded-md py-3 pl-10 pr-4 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
                {error?.email && <FormError>{error.email}</FormError>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-slate-300 text-sm mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-purple-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="w-full bg-slate-600/50 border border-slate-500 rounded-md py-3 pl-10 pr-4 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
                {error?.password && <FormError>{error.password}</FormError>}
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-md transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                disabled={navigation.state === "submitting"}
              >
                {navigation.state === "submitting" ? "Signing in..." : "Sign in"}
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center mt-6">
              <Link to="/register" className="text-yellow-400 hover:text-yellow-300 text-sm transition">
                Create an account
              </Link>
            </div>

            {error?.form && (
              <div className="mt-6">
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Oops!</AlertTitle>
                  <AlertDescription>{error.form}</AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>
    </Form>
  );
}
Component.displayName = "Login";
