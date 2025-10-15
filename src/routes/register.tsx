import type { ActionFunctionArgs } from "react-router-dom";
import { Form, redirect, useActionData, useNavigation, Link } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { AlertCircle, User, Mail, Lock, Check, Image } from "lucide-react";
import { register as apiRegister } from "../api";
import { Alert, AlertDescription, AlertTitle } from "../components/alert";
import { Input } from "../components/input";
import { FormError } from "../components/form-error";
import * as React from "react";

export async function action({ request }: ActionFunctionArgs) {
  const errors: Record<string, string> = {};
  const formData = await request.formData();

  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const role = (formData.get("role") as string) || "$";
  const avatar = formData.get("avatar") ? Number(formData.get("avatar")) : undefined;

  if (!username) errors.username = "Username is required.";
  if (!email) errors.email = "Email is required.";
  if (!password) errors.password = "Password is required.";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

  if (Object.keys(errors).length > 0) return errors;

  try {
  const session = await apiRegister(username, email, password, role, avatar);
    Cookies.set("token", (session as any).token);
    return redirect("/");
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return { form: "An account with this email already exists." };
    }
    throw error;
  }
}

export function Component() {
  const error = useActionData() as Record<string, string> | undefined;
  const navigation = useNavigation();

  const [selectedAvatar, setSelectedAvatar] = React.useState<number | null>(null);
  const [role, setRole] = React.useState<string>("$");
  const [formData, setFormData] = React.useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const avatars = [
    { id: 1, color: "bg-pink-400", emoji: "👤" },
    { id: 2, color: "bg-cyan-400", emoji: "🎮" },
    { id: 3, color: "bg-amber-400", emoji: "⚡" },
    { id: 4, color: "bg-purple-400", emoji: "🎭" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Sync avatar when role changes: user -> avatar 1, admin -> avatar 2
  React.useEffect(() => {
    if (role === "rolos admir") {
      setSelectedAvatar(2);
    } else {
      setSelectedAvatar(1);
    }
  }, [role]);

  return (
    <Form method="post">
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(100,116,139,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative w-full max-w-md">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-700 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-slate-400">Join the pixel adventure!</p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <User className="w-4 h-4 text-purple-400" />
                  Username
                </label>
                <Input id="username" name="username" value={formData.username} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
                {error?.username && <FormError>{error.username}</FormError>}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Email
                </label>
                <Input id="email" name="email" value={formData.email} onChange={handleInputChange} inputMode="email" className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
                {error?.email && <FormError>{error.email}</FormError>}
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  Password
                </label>
                <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
                {error?.password && <FormError>{error.password}</FormError>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Check className="w-4 h-4 text-purple-400" />
                  Confirm Password
                </label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
                {error?.confirmPassword && <FormError>{error.confirmPassword}</FormError>}
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
                  <Image className="w-4 h-4 text-purple-400" />
                  Choose Avatar
                </label>
                <div className="flex gap-4 justify-center">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`w-16 h-16 rounded-lg ${avatar.color} transition-all hover:scale-110 ${
                        selectedAvatar === avatar.id
                          ? 'ring-4 ring-purple-500 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="w-full h-full flex items-center justify-center text-2xl">{avatar.emoji}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Role selection */}
              <div className="flex gap-4 justify-center">
                <label className="flex items-center gap-2">
                  <input type="radio" name="role" value="$" checked={role === '$'} onChange={(e) => setRole(e.target.value)} className="accent-primary" />
                  <span className="text-sm text-slate-300">User</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="role" value="rolos admir" checked={role === 'rolos admir'} onChange={(e) => setRole(e.target.value)} className="accent-primary" />
                  <span className="text-sm text-slate-300">Admin</span>
                </label>
              </div>

              {/* Hidden inputs to submit selected avatar and role */}
              <input type="hidden" name="avatar" value={selectedAvatar ?? ''} />
              <input type="hidden" name="role" value={role} />

              {role === 'rolos admir' && (
                <div className="mt-2">
                  <Input id="adminCode" name="adminCode" type="password" placeholder="Admin code" className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition" />
                  <p className="text-xs text-slate-400 mt-1">Enter the admin code provided by the site owner to create an admin account.</p>
                </div>
              )}

              {/* Submit Button */}
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/50">
                {navigation.state === 'submitting' ? 'Creating...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center mt-4">
              <span className="text-sm text-slate-400">Already have an account?{' '}</span>
              <Link to="/login" className="text-sm font-medium text-yellow-400 underline">Sign in</Link>
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
Component.displayName = "Register";
export default Component;
