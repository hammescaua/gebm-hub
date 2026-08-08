"use client";

import { apiClient } from "@/lib/apiClient";
import { Role, Team, User } from "@/types";
import { useTransition } from "react";

interface AdminDashboardProps {
    users: User[];
    teams: Team[];
    currentUser: User;
}

const AdminDashboard = ({
    users,
    teams,
    currentUser
}: AdminDashboardProps) => {
    const [isPending, startTransition] = useTransition();

    const handleTeamAssignment = async (userId: string, teamId: string | null) => {
        startTransition(async () => {
            try {
                await apiClient.assignUserToTeam(userId, teamId);
                window.location.reload();
            }
            catch (error) {
                alert(
                    error instanceof Error
                        ? error.message
                        : "Error updating team assignment"
                );
            }
        });
    };

    const handleRoleAssignment = async (userId: string, newRole: Role) => {
        if (userId === currentUser.id) {
            alert("You cannot change your own role!");
            return;
        }
        startTransition(async () => {
            try {
                await apiClient.updateUserRole(userId, newRole);
                window.location.reload();
            }
            catch (error) {
                alert(
                    error instanceof Error
                        ? error.message
                        : "Error updating role assignment"
                );
            }
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2 text-white">
                    Admin Dashboard
                </h1>
                <p className="text-slate-300">
                    User and team management
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {/* Users table with role and team assignment */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg">
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="text-white font-semibold">
                            Users ({users.length})
                        </h3>
                        <p className="text-slate-400 text-sm">
                            Manage roles and team assignment
                        </p>
                    </div>
                    <div className="p-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="py-2 text-left text-slate-300">Name</th>
                                    <th className="py-2 text-left text-slate-300">Role</th>
                                    <th className="py-2 text-left text-slate-300">Team</th>
                                    <th className="py-2 text-left text-slate-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-slate-700">
                                        <td className="py-2 text-slate-300">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div>{user.name}</div>
                                                    <div className="text-slate-500 text-xs">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleAssignment(user.id, e.target.value as Role)}
                                                disabled={isPending || user.id === currentUser.id}
                                                className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 outline-none"
                                            >
                                                <option value={Role.PRESIDENTE}>Presidente</option>
                                                <option value={Role.VICE_PRESIDENTE}>Vice Presidente</option>
                                                <option value={Role.TESOUREIRO}>Tesoureiro</option>
                                                <option value={Role.VICE_TESOUREIRO}>Tesoureiro Vice</option>
                                                <option value={Role.DIRETOR_CULTURA}>Diretor Cultura</option>
                                                <option value={Role.VICE_DIRETOR_CULTURA}>Diretor Cultura Vice</option>
                                                <option value={Role.DIRETOR_ESPORTES}>Diretor Esportes</option>
                                                <option value={Role.VICE_DIRETOR_ESPORTES}>Diretor Esportes Vice</option>
                                                <option value={Role.DIRETOR_MARKETING}>Diretor Marketing</option>
                                                <option value={Role.VICE_DIRETOR_MARKETING}>Diretor Marketing Vice</option>
                                                <option value={Role.SECRETARIO}>Secretário</option>
                                                <option value={Role.VICE_SECRETARIO}>Secretário Vice</option>
                                                <option value={Role.AJUDANTE}>Ajudante</option>
                                                <option value={Role.USUARIO}>Usuário</option>
                                            </select>
                                        </td>
                                        <td className="py-2">
                                            <div className="flex items-center space-x-2 ">
                                                <select
                                                    value={user.teamId}
                                                    onChange={(e) => handleTeamAssignment(user.id, e.target.value || null)}
                                                    disabled={isPending}
                                                    className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 outline-none"
                                                >
                                                    <option value="">No Team</option>
                                                    {teams.map((team) => (
                                                        <option key={team.id} value={team.id}>
                                                            {team.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {user.team && (
                                                    <span className="text-xs text-slate-500">
                                                        {user.team.name}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-2">
                                            {user.teamId && (
                                                <button
                                                    onClick={() => handleTeamAssignment(user.id, null)}
                                                    disabled={isPending}
                                                    className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div >
                {/* Teams table */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg">
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="text-white font-semibold">
                            Teams ({teams.length})
                        </h3>
                        <p className="text-slate-400 text-sm">
                            Team Overview
                        </p>
                    </div>
                    <div className="p-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="py-2 text-left text-slate-300">Name</th>
                                    <th className="py-2 text-left text-slate-300">Code</th>
                                    <th className="py-2 text-left text-slate-300">Members</th>
                                    <th className="py-2 text-left text-slate-300">Managers</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((team) => {
                                    const teamMembers = users.filter((user) => user.teamId === team.id);
                                    const teamManagers = teamMembers.filter((user) => user.role === Role.PRESIDENTE || user.role === Role.VICE_PRESIDENTE);
                                    return (
                                        <tr className="border-b border-slate-700" key={team.id}>
                                            <td className="py-2 text-slate-300 font-medium">{team.name}</td>
                                            <td className="py-2">
                                                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">{team.code}</span>
                                            </td>
                                            <td className="py-2 text-slate-300 font-medium">{teamMembers.length} users</td>
                                            <td className="py-2 text-slate-300 font-medium">
                                                {teamManagers.length > 0
                                                    ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {teamManagers.map((manager) => (
                                                                <span
                                                                    key={manager.id}
                                                                    className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs"
                                                                    title={manager.name}
                                                                >
                                                                    {manager.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )
                                                    : (
                                                        <span className="text-slate-500 text-xs">
                                                            No Manager
                                                        </span>
                                                    )
                                                }
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                        {users.length}
                    </div>
                    <div className="text-slate-400 text-sm" >
                        Total Users
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                        {users.filter((user) => user.role === Role.PRESIDENTE || user.role === Role.VICE_PRESIDENTE).length}
                    </div>
                    <div className="text-slate-400 text-sm" >
                        Admins
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                        {users.filter((user) => user.role === Role.TESOUREIRO || user.role === Role.SECRETARIO).length}
                    </div>
                    <div className="text-slate-400 text-sm" >
                        Managers
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                        {users.filter((user) => user.role === Role.AJUDANTE || user.role === Role.USUARIO).length}
                    </div>
                    <div className="text-slate-400 text-sm" >
                        Users
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">
                        {teams.length}
                    </div>
                    <div className="text-slate-400 text-sm" >
                        Teams
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;