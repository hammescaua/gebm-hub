"use client";

import { useAuth } from "@/app/provider/AuthProvider";
import { User } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
    user: User | null;
}

const Header = ({ user }: HeaderProps) => {

    const pathName = usePathname();
    const { logout } = useAuth();
    const navigation = [
        { name: "Home", href: "/", show: true },
        { name: "Dashboard", href: "/dashboard", show: true }
    ].filter((item) => item.show);

    const getNavItemClass = (href: string) => {
        let isActive = false;
        if (href === "/") {
            isActive = pathName === "/";
        } else if (href === "/dashboard") {
            isActive = pathName.startsWith(href);
        }

        return `px-3 py-2 rounded-lg text-sm transition-colors font-medium ${isActive
            ? "bg-blue-600 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`;
    }

    return (
        <header className="bg-slate-900 border-b border-slate-700">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/*Logo*/}
                    <Link href="/" className="font-bold text-xl text-white">
                        Team Access
                    </Link>
                    {/*Navigation*/}
                    <nav>
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={getNavItemClass(item.href)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                    {/*User Info*/}
                    <div className="flex items-center space-x-4">
                        {user
                            ? (
                                <>
                                    <span className="text-sm text-slate-300">
                                        {user.name} ({user.role})
                                    </span>
                                    <button
                                        onClick={logout}
                                        className="px-3 py-2 bg-red-500 text-white text-sm rounded transition-colors hover:bg-red-700"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="px-3 py-2 border border-slate-600 text-slate-300 rounded transition-colors hover:bg-slate-800 hover:text-white">
                                        Login
                                    </Link>
                                    <Link href="/register" className="px-3 py-2 border border-slate-600 text-slate-300 rounded transition-colors hover:bg-slate-800 hover:text-white">
                                        Register
                                    </Link>
                                </>
                            )
                        }
                    </div>
                </div>
            </div >
        </header >
    );
};

export default Header;