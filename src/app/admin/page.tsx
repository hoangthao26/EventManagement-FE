"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import Loading from "@/components/Loading";
import { Card, Typography, Row, Col, Statistic, Table, DatePicker, Space, Button } from "antd";
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
const { RangePicker } = DatePicker;

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
    const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);

    // Mock data - sẽ thay thế bằng API call thực tế
    const stats = {
        totalStudents: 1200,
        totalLecturers: 80,
        totalEvents: 45,
        activeEvents: 12,
        upcomingEvents: 8,
        totalRegistrations: 850,
        participationRate: 78,
    };

    // Mock data cho biểu đồ đăng ký sự kiện theo thời gian
    const registrationChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Event Registrations',
                data: [65, 78, 90, 85, 95, 110],
                borderColor: '#1890ff',
                tension: 0.1,
            },
        ],
    };

    // Mock data cho biểu đồ phân bố sự kiện theo loại
    const eventTypeChartData = {
        labels: ['Workshop', 'Seminar', 'Conference', 'Training', 'Other'],
        datasets: [
            {
                data: [30, 25, 15, 20, 10],
                backgroundColor: [
                    '#ff4d4f',
                    '#ffa940',
                    '#52c41a',
                    '#1890ff',
                    '#722ed1',
                ],
            },
        ],
    };

    // Mock data cho bảng sự kiện gần đây
    const recentEvents = [
        {
            key: '1',
            name: 'Tech Workshop 2024',
            date: '2024-03-15',
            registrations: 45,
            status: 'Active',
        },
        {
            key: '2',
            name: 'Career Fair',
            date: '2024-03-20',
            registrations: 120,
            status: 'Upcoming',
        },
        {
            key: '3',
            name: 'AI Conference',
            date: '2024-03-25',
            registrations: 80,
            status: 'Upcoming',
        },
    ];

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
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <AntTitle level={2}>Admin Dashboard</AntTitle>
                    <Space>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates: [moment.Moment, moment.Moment] | null) => setDateRange(dates as [moment.Moment, moment.Moment])}
                        />
                        <Button type="primary">Update Stats</Button>
                    </Space>
                </div>

                {/* Thống kê tổng quan */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Students"
                                value={stats.totalStudents}
                                prefix={<TeamOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Lecturers"
                                value={stats.totalLecturers}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Active Events"
                                value={stats.activeEvents}
                                prefix={<PlayCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Upcoming Events"
                                value={stats.upcomingEvents}
                                prefix={<ScheduleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Biểu đồ và thống kê chi tiết */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} lg={16}>
                        <Card title="Event Registrations Over Time">
                            <Line data={registrationChartData} />
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card title="Event Types Distribution">
                            <Pie data={eventTypeChartData} />
                        </Card>
                    </Col>
                </Row>

                {/* Thống kê bổ sung */}
                <Row gutter={[16, 16]} className="mb-6">
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

                {/* Bảng sự kiện gần đây */}
                <Card title="Recent Events" className="mb-6">
                    <Table
                        columns={columns}
                        dataSource={recentEvents}
                        pagination={false}
                    />
                </Card>
            </div>
        </DashboardLayout>
    );
}