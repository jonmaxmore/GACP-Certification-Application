import { redirect } from "next/navigation";

export default function AdminDashboardPage() {
    // Admin dashboard redirects to staff dashboard with admin view
    redirect("/staff/dashboard/admin");
}
