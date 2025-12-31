import { redirect } from "next/navigation";

/**
 * Root page redirects to Login page
 * เปิดหน้าแรกแล้วไปหน้า Login เลย
 */
export default function Home() {
  redirect("/login");
}
