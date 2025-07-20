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
import axios from 'axios';

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

interface MonthlyRegistration {
    month: number;
    count: number;
}

interface EventTypeDistribution {
    seminar: number;
    workshop: number;
}

export default function AdminDashboardPage() {
    const { session, status } = useAuth();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalLecturers: 0,
        totalEvents: 0,
        activeEvents: 0,
        upcomingEvents: 0,
        totalRegistrations: 0,
        participationRate: 0
    });
    const [registrationData, setRegistrationData] = useState<MonthlyRegistration[]>([]);
    const [eventTypeData, setEventTypeData] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const currentYear = new Date().getFullYear();
    const yearOptions = [];
    for (let year = 2015; year <= currentYear; year++) {
        yearOptions.push({ value: year, label: year.toString() });
    }

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`
                    }
                });
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.accessToken) {
            fetchStats();
        }
    }, [session]);

    useEffect(() => {
        const fetchRegistrationData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/events-by-month?year=${selectedYear}`, {
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`
                    }
                });
                setRegistrationData(response.data);
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    // Nếu không có dữ liệu, set 12 tháng đều 0
                    setRegistrationData(Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 })));
                } else {
                    console.error('Failed to fetch registration data:', error);
                }
            }
        };

        if (session?.accessToken) {
            fetchRegistrationData();
        }
    }, [session, selectedYear]);

    useEffect(() => {
        const fetchEventTypeData = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/event-types-distribution?year=${selectedYear}`, {
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`
                    }
                });
                setEventTypeData(response.data);
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    // Nếu không có dữ liệu, set object rỗng
                    setEventTypeData({});
                } else {
                    console.error('Failed to fetch event type distribution:', error);
                }
            }
        };

        if (session?.accessToken) {
            fetchEventTypeData();
        }
    }, [session, selectedYear]);

    if (status === "loading" || loading) {
        return <Loading />;
    }

    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const registrationChartData = {
        labels: labels,
        datasets: [
            {
                label: 'Event Registrations',
                data: labels.map((_, index) => {
                    const monthData = registrationData.find(item => item.month === index + 1);
                    return monthData ? monthData.count : 0;
                }),
                borderColor: '#1890ff',
                tension: 0.1,
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    const eventTypeChartData = {
        labels: Object.keys(eventTypeData || {}),
        datasets: [
            {
                data: Object.values(eventTypeData || {}),
                backgroundColor: [
                    '#ff4d4f', // Red
                    '#ffa940', // Orange
                    '#52c41a', // Green
                    '#1890ff', // Blue
                    '#722ed1', // Purple
                    '#13c2c2', // Cyan
                    '#eb2f96', // Pink
                    '#0050b3', // Dark Blue
                ],
                borderColor: 'rgba(0,0,0,0)',
            },
        ],
    };

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
                    </Row>
                    
                    <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
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
                                    value={Number(stats.participationRate).toFixed(2)}
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
                        <Row style={{ marginBottom: '20px' }}>
                            <Col xs={24}>
                                <Statistic
                                    title={`Total Events in ${selectedYear}`}
                                    value={registrationData.reduce((sum, item) => sum + item.count, 0)}
                                    prefix={<CalendarOutlined />}
                                />
                            </Col>
                        </Row>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} lg={15}>
                                <Line data={registrationChartData} options={chartOptions} />
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