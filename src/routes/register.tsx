import type { ActionFunctionArgs } from "react-router-dom";
import { Form, redirect, useActionData, useNavigation, Link } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import { register as apiRegister } from "../api";
import { Alert, AlertDescription, AlertTitle } from "../components/alert";
import { FormError } from "../components/form-error";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { LoadingButton } from "../components/loading-button";
import * as React from "react";

export async function action({ request }: ActionFunctionArgs) {
  const errors: Record<string, string> = {};
  const formData = await request.formData();

  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const role = (formData.get("role") as string) || "user";
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
  const [role, setRole] = React.useState<string>("user");
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
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-r from-cyan-500 to-primary">
        <Card className="m-6 w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join the pixel adventure!</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleInputChange} />
              {error?.username && <FormError>{error.username}</FormError>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" value={formData.email} onChange={handleInputChange} inputMode="email" />
              {error?.email && <FormError>{error.email}</FormError>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} />
              {error?.password && <FormError>{error.password}</FormError>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} />
              {error?.confirmPassword && <FormError>{error.confirmPassword}</FormError>}
            </div>

            <div>
              <Label>Role</Label>
              <div className="flex gap-4 justify-center py-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="role" value="user" checked={role === 'user'} onChange={(e) => setRole(e.target.value)} className="accent-primary" />
                  <span className="text-sm">User</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="role" value="rolos admir" checked={role === 'rolos admir'} onChange={(e) => setRole(e.target.value)} className="accent-primary" />
                  <span className="text-sm">Admin</span>
                </label>
              </div>

              <Label>Choose Avatar</Label>
              <div className="flex gap-6 justify-center py-2">
                {avatars.map((avatar) => {
                  const label = avatar.id === 1 ? 'User avatar' : avatar.id === 2 ? 'Admin avatar' : `Avatar ${avatar.id}`;
                  return (
                    <div key={avatar.id} className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        title={label}
                        aria-label={label}
                        onClick={() => { setSelectedAvatar(avatar.id); setRole(role); }}
                        className={`w-16 h-16 rounded-lg ${avatar.color} transition-all hover:scale-110 ${selectedAvatar === avatar.id ? 'ring-4 ring-primary scale-105' : 'opacity-70 hover:opacity-100'}`}
                      >
                        <div className="w-full h-full flex items-center justify-center text-2xl">{avatar.emoji}</div>
                      </button>
                      <span className="text-xs text-slate-400">{label}</span>
                    </div>
                  );
                })}
              </div>
              {/* Hidden inputs to submit selected avatar and role */}
              <input type="hidden" name="avatar" value={selectedAvatar ?? ''} />
              <input type="hidden" name="role" value={role} />
              {role === 'rolos admir' && (
                <div className="mt-2">
                  <Label htmlFor="adminCode">Admin Code</Label>
                  <Input id="adminCode" name="adminCode" type="password" />
                  <p className="text-xs text-slate-400 mt-1">Enter the admin code provided by the site owner to create an admin account.</p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <LoadingButton loading={navigation.state === "submitting"} type="submit" className="w-full">Create account</LoadingButton>
          </CardFooter>

          <div className="text-center mt-2">
            <span className="text-sm text-slate-400">Already have an account?{' '}</span>
            <Link to="/login" className="text-sm font-medium text-primary underline">Sign in</Link>
          </div>

          {error?.form && (
            <CardFooter>
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Oops!</AlertTitle>
                <AlertDescription>{error.form}</AlertDescription>
              </Alert>
            </CardFooter>
          )}
        </Card>
      </div>
    </Form>
  );
}
Component.displayName = "Register";
export default Component;
