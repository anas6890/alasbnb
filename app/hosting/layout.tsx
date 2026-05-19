import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import HostNavbar from "@/components/navbar/HostNavbar";
import { redirect } from "next/navigation";

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <ClientOnly>
        <HostNavbar currentUser={currentUser} />
      </ClientOnly>
      <main className="flex-1 pt-20 pb-10">
        {children}
      </main>
    </div>
  );
}
