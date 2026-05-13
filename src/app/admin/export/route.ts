import prisma  from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET() {
  await requireRole("ADMIN");
  
  const users = await prisma.user.findMany();
  const csv = [
    ["Nom", "Email", "Role"],
    ...users.map((u: { fullName: string; email: string; role: string }) => [u.fullName, u.email, u.role])
  ].map(e => e.join(",")).join("\n");

  return new Response(csv, {
    headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="users.csv"' }
  });
}