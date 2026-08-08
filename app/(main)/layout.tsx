import React from "react";
import Header from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
    const user = await getCurrentUser();
    return (
        <>
            <Header user={user ?? null} />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </>
    );
};

export default MainLayout;