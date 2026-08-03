"use client";

type MainContentProps = {
    children: React.ReactNode;
};

export function MainContent({ children }: MainContentProps) {
    return (
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
            <div className="mx-auto w-full max-w-7xl">
                {children}
            </div>
        </main>
    );
}