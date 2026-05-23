import { createSupabaseServerClient } from "@/lib/supabase/server";
import SiteHeaderClient from "@/app/components/site-header-client";

export default async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return <SiteHeaderClient userEmail={user?.email ?? null} />;
}
