"use client";

import { Sidebar } from "./Sidebar";
import { MainContent } from "./MainContent";

type WorkspaceProps = {
    children: React.ReactNode;
};

export function Workspace({ children }: WorkspaceProps) {
    return (
        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[240px_1fr]">
            <Sidebar />

            <MainContent>
                {children}
            </MainContent>
        </div>
    );
}