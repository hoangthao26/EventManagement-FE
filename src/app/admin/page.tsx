"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import DashboardLayout from "@/widgets/layouts/ui/DashboardLayout";
import Loading from "@/shared/ui/Loading";
import { Card, Typography, Row, Col, Statistic, Select, Divider } from "antd";
import {
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
    PlayCircleOutlined,
    RiseOutlined,
    ScheduleOutlined
} from "@ant-design/icons";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import moment from 'moment';

const { Title: AntTitle } = Typography;

// Đăng ký các components cho Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function AdminDashboardPage() {
    const { session, status } = useAuth();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = 2015; year <= currentYear; year++) {
        yearOptions.push({ value: year, label: year.toString() });
    }
    if (status === "loading") {
        return <Loading />;
    }

    // Mock data - sẽ thay thế bằng API call thực tế
    const stats = {
        totalUsers: 1280,
        totalStudents: 1200,
        totalLecturers: 80,
        totalEvents: 45,
        activeEvents: 12,
        upcomingEvents: 8,
        totalRegistrations: 850,
        participationRate: 78,
    };

    // Mock data cho biểu đồ đăng ký sự kiện theo thời gian
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const registrationChartData = {
        labels: labels,
        datasets: [
            {
                label: 'Event Registrations',
                data: [65, 78, 90, 85, 95, 110, 120, 130, 140, 150, 160, 170],
                borderColor: '#1890ff',
                tension: 0.1,
            },
        ],
    };

    // Mock data cho biểu đồ phân bố sự kiện theo loại
    const eventTypeChartData = {
        labels: ['Seminar',
            'Workshop',
            'Conference',
            'Webinar',
            'Orientation',
            'Guest Lecture',
            'Networking Event',
            'Career Fair'],
        datasets: [
            {
                data: [30, 25, 15, 20, 10, 15, 20, 25],
                backgroundColor: [
                   '#ff4d4f', // Seminar
                    '#ffa940', // Workshop
                    '#52c41a', // Conference
                    '#1890ff', // Webinar
                    '#722ed1', // Orientation
                    '#13c2c2', // Guest Lecture
                    '#eb2f96', // Networking Event
                    '#0050b3', // Career Fair
                ],
                borderColor: 'rgba(0,0,0,0)',
            },
        ],
    };
    const columns = [
        {
            title: 'Event Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Registrations',
            dataIndex: 'registrations',
            key: 'registrations',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <span style={{ color: status === 'Active' ? '#52c41a' : '#1890ff' }}>
                    {status}
                </span>
            ),
        },
    ];

    return (
        <DashboardLayout>
            
               
                    <AntTitle level={2}>Admin Dashboard</AntTitle>

                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="mb-6" style={{ marginBottom: '20px' }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card style={{ height: '100%' }}>
                            <Statistic
                                title="Total Users"
                                value={stats.totalUsers}
                                prefix={<TeamOutlined />}
                            />
                            <div style={{ marginTop: '10px' }}>
                            <Statistic
                                title="Total Students"
                                value={stats.totalStudents}
                                prefix={<UserOutlined />}
                                valueStyle={{ fontSize: 16 }}
                            />
                            <Statistic
                                title="Total Lecturers"
                                value={stats.totalLecturers}
                                prefix={<UserOutlined />}
                                valueStyle={{ fontSize: 16 }}
                            />
                            </div>
                        </Card>
                    </Col>
                    <Col md={18}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <Card>
                                    <Statistic
                                        title="Total Events"
                                        value={stats.totalEvents}
                                        prefix={<CalendarOutlined />}
                                    />
                                </Card>
                            </Col>

                            <Col xs={24} sm={12} md={8}>
                                <Card>
                                    <Statistic
                                        title="Active Events"
                                        value={stats.activeEvents}
                                        prefix={<PlayCircleOutlined />}
                                    />
                                </Card>

                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card>
                                    <Statistic
                                        title="Upcoming Events"
                                        value={stats.upcomingEvents}
                                        prefix={<ScheduleOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]} className="mb-6" justify="center" style={{ marginTop: '10px' }}>
                            <Col xs={24} sm={12} md={8}>
                                <Card>
                                    <Statistic
                                        title="Total Registrations"
                                        value={stats.totalRegistrations}
                                        prefix={<TeamOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Card>
                                    <Statistic
                                        title="Participation Rate"
                                        value={stats.participationRate}
                                        prefix={<RiseOutlined />}
                                        suffix="%"
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Biểu đồ và thống kê chi tiết */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24}>
                        <Card
                            title={
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span>Event Statistics by Year</span>
                                    <Select
                                        value={selectedYear}
                                        style={{ width: 100 }}
                                        onChange={setSelectedYear}
                                        options={yearOptions}
                                    />
                                </div>
                            }
                        >
                            <Row gutter={[16, 16]}>
                                <Col xs={24} lg={15}>
                                    <Line data={registrationChartData} />
                                </Col>
                                <Col xs={24} lg={1}>
                                    <Divider type="vertical" style={{ height: '100%' }} />
                                </Col>
                                <Col xs={24} lg={8}>
                                    <Pie data={eventTypeChartData} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

            
        </DashboardLayout>
    );
}