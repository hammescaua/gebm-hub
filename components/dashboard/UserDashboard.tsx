import { User } from "@/types";

interface UserDashboardProps {
    teamMembers: User[];
    currentUser: User;
}

export default function UserDashboard({ teamMembers, currentUser }: UserDashboardProps) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2 text-white">
                    User Dashboard
                </h1>
                <p className="text-slate-300">
                    Welcome, {currentUser.name}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* My Team */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg">
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="text-white font-semibold">
                            My Team Members ({teamMembers.length})
                        </h3>
                    </div>
                    <div className="p-4">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className="border-b border-slate-700 py-2 last:border-b-0"
                            >
                                <p className="font-medium text-white">
                                    {member.name}
                                </p>
                                <p className="text-slate-400 text-sm">
                                    {member.role}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}