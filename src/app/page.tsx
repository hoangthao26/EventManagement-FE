"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import CTASection from "@/components/home/CTASection";
import EventCarousel from "@/components/home/EventCarousel";
import StatisticsSection from "@/components/home/StatisticsSection";
import UpcomingSection from "@/components/home/UpcomingSection";
import HomeLayout from "@/widgets/layouts/ui/HomeLayout";
import Loading from "@/shared/ui/Loading";
import { Card, Typography, Row, Col, Button } from "antd";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function HomePage() {
  // DEVELOPMENT BYPASS - Remove auth checks
  const { session, status, redirectBasedOnRole } = useAuth();
  const router = useRouter();

  // Remove auth effect
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
    if (status === "authenticated" && session?.user?.roles) {
      redirectBasedOnRole();
    }
  }, [status, session, redirectBasedOnRole, router]); 

  // Remove loading check
  if (status === "loading") {
    return <Loading />;
  }

  // Mock data
  const events = [
    {
      id: 1,
      title: "Workshop React",
      description: "Learn React basics",
      date: "2024-03-20",
      location: "Room 101",
      capacity: 50,
      registered: 30
    },
    // Add more mock events as needed
  ];

  return (
    <HomeLayout>
      {/* Carousel section - full width */}
      <div style={{ width: '100%', margin: 0, padding: 0 }}>
        <EventCarousel />
      </div>
      <UpcomingSection />

      {/* Statistics section - let the component handle its own container */}
      <StatisticsSection />

      {/* CTA section - let the component handle its own container */}
      <CTASection />
    </HomeLayout>
  );
}
