'use client'

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { API_URL } from "../../../lib/constants";

export default function RetryButton({ batchId }: { batchId: string }) {
  const router = useRouter();

  const handleRetry = async () => {
    await fetch(`${API_URL}/batches/${batchId}/retry-failed`, {
      method: 'POST',
    });
    router.refresh();
  };

  return (
    <Button onClick={handleRetry}>
      Retry Failed
    </Button>
  );
}