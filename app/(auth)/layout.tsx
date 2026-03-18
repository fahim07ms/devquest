export default async function RSLayout({
                                           children,
                                       }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className={"flex flex-col h-screen justify-between"}>

            <div>
                {children}
            </div>


        </main>
    );
}