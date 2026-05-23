import "../styles/globals.css";
import getCurrentUser from "./actions/getCurrentUser";
import NextAuthProvider from "./providers/NextAuthProvider";
import ClientLayout from "./providers/ClientLayout";

export const metadata = {
  title: "AlasBnB",
  description: "La plateforme de location de logements et d'expériences uniques.",
  icons: "/assets/logo.png",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <html lang="en">
      <body className="font-sans antialiased text-neutral-800">
        <NextAuthProvider>
          <ClientLayout currentUser={currentUser}>
            {children}
          </ClientLayout>
        </NextAuthProvider>
      </body>
    </html>
  );
}
