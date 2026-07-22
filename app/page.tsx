import { getCurrentUser } from "@/lib/current-user";
import { AppShell } from "@/components/AppShell";

export default async function Home() {
  const user = await getCurrentUser();
  return <AppShell userName={user.name} />;
}
