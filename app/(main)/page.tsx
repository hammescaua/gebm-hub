import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

const Home = async () => {
    const user = await getCurrentUser();

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-white">
                Team Access Control Demo
            </h1>
            <p className="text-slate-300 mb-8">
                This demo showcases Next.js 16 access control features with role-based permissions.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800 p-6 border border-slate-700 rounded-lg">
                    <h3 className="text-white font-semibold mb-3">
                        Features Demonstrated
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                        <li>Role-based access control (RBAC)</li>
                        <li>Route protection with middleware</li>
                        <li>Server-side permission checks</li>
                        <li>Client-side permission hooks</li>
                        <li>Dynamic route access</li>
                    </ul>
                </div>
                <div className="bg-slate-800 p-6 border border-slate-700 rounded-lg">
                    <h3 className="text-white font-semibold mb-3">
                        Users Roles
                    </h3>
                    <ul className="space-y-2 text-slate-300">
                        <li><strong className="text-green-400">Presidente:</strong> Full system access and management</li>
                        <li><strong className="text-green-400">Vice Presidente:</strong> Same as president but without access to financial information</li>
                        <li><strong className="text-blue-400">Tesoureiro:</strong> Access to financial information and management</li>
                        <li><strong className="text-blue-400">Tesoureiro Vice:</strong> Same as tesoureiro but without access to financial information</li>
                        <li><strong className="text-purple-400">Diretor:</strong> Access to team information and management</li>
                        <li><strong className="text-purple-400">Diretor Vice:</strong> Same as diretor but without access to financial information</li>
                        <li><strong className="text-purple-400">Secretario:</strong> Access to team information and management</li>
                        <li><strong className="text-yellow-400">Secretario Vice:</strong> Same as secretario but without access to financial information</li>
                        <li><strong className="text-yellow-400">Usuario:</strong> Regular member view</li>
                    </ul>
                </div>
            </div>
            {user ? (
                <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                    <p className="text-green-300">
                        Welcome back, <strong>{user.name}</strong>! You are logged in as{" "}<strong className="text-green-200">{user.role}</strong>
                    </p>
                    <Link href="/dashboard" className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded transition-colors hover:bg-blue-700">
                        Go to Dashboard
                    </Link>
                </div>
            ) : (
                <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                    <p className="text-slate-300 mb-3">
                        You are not logged in.
                    </p>
                    <div className="space-x-3">
                        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded transition-colors hover:bg-blue-700">
                            Login
                        </Link>
                        <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded transition-colors hover:bg-blue-700">
                            Register
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;