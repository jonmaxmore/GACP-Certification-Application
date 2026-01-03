/**
 * Loading fallback for (farmer) route group
 * Automatically used by Next.js as Suspense fallback
 */
import { PageLoading } from "@/components/ui/loading-spinner";

export default function FarmerLoading() {
    return <PageLoading />;
}
