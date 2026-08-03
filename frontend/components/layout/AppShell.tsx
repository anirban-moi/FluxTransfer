import { Header } from "./Header";
import { Workspace } from "./Workspace";
import { StatusBar } from "./StatusBar";

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <Workspace>{children}</Workspace>
            <StatusBar />
        </div>
    );
}