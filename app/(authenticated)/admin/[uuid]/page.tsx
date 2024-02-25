import {
  Table,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPanel({
  params,
}: {
  params: { uuid: string };
}) {
  const supabase = createClient();
  const userId = await getUserId();

  let { data: profiles, error } = await supabase
    .from("user_permissions")
    .select("admin")
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    return;
  }

  if (!profiles || !profiles[0]?.admin) {
    redirect("/app");
  }

  const getAllHunches = async () => {
    const { data, error } = await supabase
      .from("detailed_hunches")
      .select("*")
      .eq("user_id", params.uuid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    return data;
  };

  return (
    <div className="absolute top-0 left-0 p-12 w-full flex flex-col items-center min-h-screen">
      <div className="flex flex-col items-center w-full">
        <header className="flex items-center justify-between w-full px-4 py-2 border-b border-secondary">
          <Link href="/app">
            <h1 className="text-2xl font-bold">Hunchifier</h1>
          </Link>
          <p className="text-primary">Viewing hunches for {params.uuid}</p>
          <Link href="/admin">
            <p className="text-primary hover:underline">Back to admin panel</p>
          </Link>
        </header>
      </div>
      <Table className="w-full">
        <TableCaption>All hunches</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User email</TableHead>
            <TableHead>Problem</TableHead>
            <TableHead>Solution</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-right">Created at</TableHead>
          </TableRow>
        </TableHeader>
        <tbody>
          {await getAllHunches().then((hunches) => {
            return hunches?.map((hunch) => {
              return (
                <TableRow key={hunch.id} className="hover:bg-secondary">
                  <TableCell className="break-words max-w-64 align-top font-semibold">
                    {hunch.email}
                  </TableCell>
                  <TableCell className="break-words max-w-64 align-top">
                    {hunch.possible_problem}
                  </TableCell>
                  <TableCell className="break-words max-w-64 align-top">
                    {hunch.possible_solution}
                  </TableCell>
                  <TableCell className="break-words max-w-64 align-top">
                    {hunch.possible_client}
                  </TableCell>
                  <TableCell className="text-right align-top">
                    {formatDateTime(hunch.created_at)}
                  </TableCell>
                </TableRow>
              );
            });
          })}
        </tbody>
      </Table>
    </div>
  );
}

function formatDateTime(date: Date) {
  const d = new Date(date);
  const localTime = d.toLocaleTimeString("en-US");
  return `${d.toLocaleDateString()} ${localTime}`;
}
