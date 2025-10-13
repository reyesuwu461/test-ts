import * as React from "react";
import {
  Link,
  NavLink,
  Outlet,
  ScrollRestoration,
  useLoaderData,
  useMatch,
} from "react-router-dom";
import { Car, CirclePlus, House, Menu } from "lucide-react";
import { getUser } from "../api";
import { Button } from "../components/button";
import { ModeToggle } from "../components/mode-toggle";
import { Sheet, SheetContent, SheetTitle } from "../components/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/tooltip";
import { UserAvatar } from "../components/user-avatar";
import { cn } from "../lib/cn";
import { privateLoader } from "../lib/private-loader";
import type { User } from "../types";

function NavigationItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: React.ReactNode;
  icon: React.ElementType;
}) {
  const match = useMatch(to);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Note: NavLink does not work with asChild */}
        <Link
          to={to}
          className={cn(
            "rounded-lg p-2",
            match ? "bg-primary hover:bg-primary/90" : "hover:bg-accent",
          )}
        >
          <Icon className={cn("size-6", match && "text-primary-foreground")} />
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function Navigation({ user }: { user?: User }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[72px] border-r bg-background sm:block">
      <div className="flex justify-center p-2">
        <img
          src="/vite.svg"
          alt="Logo"
          className="w-full rounded-full bg-accent p-2"
        />
      </div>

      <TooltipProvider>
        <nav className="flex flex-col gap-4 p-4">
          <NavigationItem to="/" icon={House} label="Home" />
          <NavigationItem to="/vehicles" icon={Car} label="Vehicles" />
          {user?.role === "rolos admir" && (
            <NavigationItem to="/add" icon={CirclePlus} label="Add Vehicle" />
          )}
        </nav>
      </TooltipProvider>
    </aside>
  );
}

function MobileNavigationItem(props: {
  to: string;
  onClick: () => void;
  icon: React.ElementType;
  label: React.ReactNode;
}) {
  const Icon = props.icon;

  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-4 rounded-lg p-2",
          isActive ? "bg-primary hover:bg-primary/90" : "hover:bg-accent",
        )
      }
      onClick={props.onClick}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn("size-6", isActive && "text-primary-foreground")}
          />
          <span
            className={cn("text-base", isActive && "text-primary-foreground")}
          >
            {props.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

function MobileNavigation(props: {
  open: boolean;
  onOpenChange: () => void;
  user?: User;
}) {
  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent
        className="max-w-72"
        side="left"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <nav className="mr-6 flex flex-col gap-4">
          <MobileNavigationItem
            to="/"
            onClick={props.onOpenChange}
            icon={House}
            label="Home"
          />
          <MobileNavigationItem
            to="/vehicles"
            onClick={props.onOpenChange}
            icon={Car}
            label="Vehicles"
          />
          {props.user?.role === "rolos admir" && (
            <MobileNavigationItem
              to="/add"
              onClick={props.onOpenChange}
              icon={CirclePlus}
              label="Add"
            />
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

Root.loader = privateLoader(async () => await getUser());

export function Root() {
  const user = useLoaderData() as User;
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  return (
    <>
      <Navigation user={user} />

      <MobileNavigation
        open={isSheetOpen}
        onOpenChange={() => setIsSheetOpen(false)}
        user={user}
      />

      <div className="flex w-full flex-col sm:pl-[72px]">
        <header className="sticky top-0 z-50 bg-transparent backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2">
            <Button
              variant="outline"
              size="icon"
              className="flex sm:hidden"
              onClick={() => setIsSheetOpen(true)}
            >
              <Menu />
            </Button>

            <h1 className="grow text-lg font-medium">Vehicle Manager</h1>

            <ModeToggle />
            <UserAvatar user={user} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4">
          <Outlet />
        </main>
      </div>

      <ScrollRestoration />
    </>
  );
}
