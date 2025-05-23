"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import AppLayout from "@/components/AppLayout";
import Loading from "@/components/Loading";
//  Home page (danh sách events)
export default function HomePage() {
  const { session, status, redirectBasedOnRole } = useAuth();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.roles) {
      redirectBasedOnRole();
    } else if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status, session, redirectBasedOnRole]);

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100">
        <Loading />
      </div>
    </AppLayout>
  );
}
