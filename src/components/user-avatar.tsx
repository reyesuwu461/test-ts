import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import type { User } from "../types";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function UserAvatar(props: { user: User }) {
  const avatar = props.user.avatar || '';

  // Map known avatar tokens to emoji + tailwind color used in register.tsx
  const avatarMap: Record<string, { color: string; emoji: string }> = {
    'avatar-1': { color: 'bg-pink-400', emoji: '👤' },
    'avatar-2': { color: 'bg-cyan-400', emoji: '🎮' },
    'avatar-3': { color: 'bg-amber-400', emoji: '⚡' },
    'avatar-4': { color: 'bg-purple-400', emoji: '🎭' },
    'avatar-admin': { color: 'bg-cyan-400', emoji: '🎮' },
    'avatar-user': { color: 'bg-pink-400', emoji: '👤' },
  };

  const isToken = avatar.startsWith('avatar');
  const tile = isToken ? avatarMap[avatar] ?? avatarMap['avatar-user'] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 overflow-hidden rounded-full"
          aria-label="User menu"
        >
          {isToken && tile ? (
            <div className={`w-8 h-8 rounded-full ${tile.color} flex items-center justify-center text-sm`}>{tile.emoji}</div>
          ) : (
            <img
              className="overflow-hidden rounded-full"
              src={props.user.avatar}
              width={32}
              height={32}
              alt={props.user.name}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span>{props.user.name}</span>
          <span className="font-normal">{props.user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/login"
            onClick={() => {
              Cookies.remove("token");
            }}
          >
            Log out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
