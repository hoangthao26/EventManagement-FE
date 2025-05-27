"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import HomeLayout from "@/components/HomeLayout";
import Loading from "@/components/Loading";
import CTASection from "@/components/home/CTASection";
import EventCarousel from "@/components/home/EventCarousel";
import StatisticsSection from "@/components/home/StatisticsSection";
import { Card, Typography, Row, Col, Button } from "antd";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function HomePage() {
  // DEVELOPMENT BYPASS - Remove auth checks
  // const { session, status } = useAuth();
  const router = useRouter();

  // Remove auth effect
  // useEffect(() => {
  //     if (status === "unauthenticated") {
  //         window.location.href = "/login";
  //     }
  // }, [status]);

  // Remove loading check
  // if (status === "loading") {
  //     return <Loading />;
  // }

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
      
      {/* Events section */}
      <div style={{ width: '100%', margin: 0, padding: '64px 50px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <Title level={2}>Upcoming Events</Title>
          <Row gutter={[16, 16]}>
            {events.map((event) => (
              <Col xs={24} sm={12} md={8} lg={6} key={event.id}>
                <Card
                  hoverable
                  title={event.title}
                  onClick={() => router.push(`/${event.id}`)}
                >
                  <Paragraph>{event.description}</Paragraph>
                  <p>Date: {event.date}</p>
                  <p>Location: {event.location}</p>
                  <p>Capacity: {event.registered}/{event.capacity}</p>
                  <Button
                    type="primary"
                    block
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      router.push(`/${event.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Statistics section - let the component handle its own container */}
      <StatisticsSection />

      {/* CTA section - let the component handle its own container */}
      <CTASection />
    </HomeLayout>
  );
}
