'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/model/useAuth';
import DashboardLayout from '@/widgets/layouts/ui/DashboardLayout';
import Loading from '@/shared/ui/Loading';
import { Card, Typography, Row, Col, Statistic, List, Button, Tabs, Spin } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    DownloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useParams } from 'next/navigation';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { utils, writeFile } from 'xlsx';
import { SurveyQuestionType } from '@/features/create-survey/model/types';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const { Title: AntTitle, Text } = Typography;
const { TabPane } = Tabs;

// Define dashboard data interface based on Swagger API
interface EventDashboardData {
    totalRegistered: number;
    studentCount: number;
    lecturerCount: number;
    attendedCount: number;
    attendedRate: number;
    surveyQuestions?: SurveyQuestion[];
}

interface SurveyOption {
    text: string;
    count: number;
    percentage: number;
}

interface SurveyQuestion {
    question: string;
    type: SurveyQuestionType;
    options: SurveyOption[];
}

export default function EventOverviewPage() {
    const { session, status } = useAuth();
    const params = useParams();
    const departmentCode = params.departmentCode as string;
    const eventId = parseInt(params.eventId as string);
    
    const [dashboardData, setDashboardData] = useState<EventDashboardData>({
        totalRegistered: 0,
        studentCount: 0,
        lecturerCount: 0,
        attendedCount: 0,
        attendedRate: 0,
        surveyQuestions: []
    });
    const [loading, setLoading] = useState(true);
    const [eventDetail, setEventDetail] = useState<any>();

    useEffect(() => {
        const fetchEventDashboard = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/${eventId}/dashboard?departmentCode=${departmentCode}`,
                    {
                        headers: {
                            Authorization: `Bearer ${session?.accessToken}`
                        }
                    }
                );
                setDashboardData(response.data);
            } catch (error) {
                console.error('Failed to fetch event dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.accessToken) {
            fetchEventDashboard();
        }
        const fetchEventDetail = async () => {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`
                    }
                }
            );
            setEventDetail(response.data);
        };

        if (session?.accessToken) {
            fetchEventDetail();
        } 
    }, [session, eventId, departmentCode]);

    // const exportToExcel = (question: SurveyQuestion) => {
    //     // Create worksheet with question data
    //     const worksheet = utils.json_to_sheet(
    //         question.type === 'TEXT' 
    //             ? question.options.map(option => ({ Response: option.text }))
    //             : question.options.map(option => ({
    //                 Option: option.text,
    //                 Count: option.count,
    //                 Percentage: `${option.percentage}%`
    //             }))
    //     );
        
    //     // Create workbook
    //     const workbook = utils.book_new();
    //     utils.book_append_sheet(workbook, worksheet, 'Survey Responses');
        
    //     // Generate Excel file and download
    //     const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    //     writeFile(workbook, `${eventDetail.name}_${question.question.substring(0, 30)}_${timestamp}.xlsx`);
    // };

    const exportAllToExcel = () => {
        if (!dashboardData.surveyQuestions || dashboardData.surveyQuestions.length === 0) {
            return;
        }
        
        // Create workbook
        const workbook = utils.book_new();
        
        // Add summary sheet with event information
        const summaryData = [
            ['Event Survey Results Summary'],
            [''],
            ['Total Registered:', dashboardData.totalRegistered],
            ['Students:', dashboardData.studentCount],
            ['Lecturers:', dashboardData.lecturerCount],
            ['Attended Count:', dashboardData.attendedCount],
            ['Attendance Rate:', `${dashboardData.attendedRate}%`],
            ['Total Survey Questions:', dashboardData.surveyQuestions.length],
            ['']
        ];
        
        const summaryWs = utils.aoa_to_sheet(summaryData);
        utils.book_append_sheet(workbook, summaryWs, 'Summary');
        
        // Add each question as a separate worksheet
        dashboardData.surveyQuestions.forEach((question, index) => {
            const sheetName = `Q${index + 1}`;
            
            // Create header rows with question information
            const headerRows = [
                [`Question ${index + 1}: ${question.question}`],
                [`Type: ${question.type}`],
                ['']
            ];
            
            // Create data rows based on question type
            let dataRows = [];
            if (question.type === 'TEXT') {
                dataRows = [
                    ['Response Number', 'Text Response'],
                    ...question.options.map((opt, i) => [i + 1, opt.text])
                ];
            } else {
                dataRows = [
                    ['Option', 'Count', 'Percentage'],
                    ...question.options.map(opt => [opt.text, opt.count, `${opt.percentage}%`])
                ];
            }
            
            // Combine headers and data
            const allRows = [...headerRows, ...dataRows];
            
            const worksheet = utils.aoa_to_sheet(allRows);
            
            // Set column widths
            const wscols = [
                {wch: 40}, // Option/Response column
                {wch: 10}, // Count column
                {wch: 15}  // Percentage column
            ];
            worksheet['!cols'] = wscols;
            
            // Append worksheet to workbook
            utils.book_append_sheet(workbook, worksheet, sheetName);
        });
        
        // Generate Excel file and download
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        writeFile(workbook, `${eventDetail.name}_Survey_Results_${timestamp}.xlsx`);
    };

    const renderChartForQuestion = (question: SurveyQuestion) => {
        if (!question.options || question.options.length === 0) {
            return <Text>No data available</Text>;
        }

        if (question.type === 'TEXT') {
            return (
                <List
                    bordered
                    dataSource={question.options}
                    renderItem={(option: SurveyOption) => (
                        <List.Item>
                            {option.text}
                        </List.Item>
                    )}
                />
            );
        } else {
            // For RADIO, CHECKBOX, DROPDOWN types
            
            // Generate dynamic colors for any number of options
            const generateColors = (count: number) => {
                const baseColors = [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(199, 199, 199, 0.6)',
                    'rgba(83, 102, 255, 0.6)',
                    'rgba(78, 129, 189, 0.6)',
                    'rgba(192, 80, 77, 0.6)',
                ];
                
                // If we have more options than base colors, generate additional colors
                if (count <= baseColors.length) {
                    return baseColors.slice(0, count);
                } else {
                    const colors = [...baseColors];
                    
                    // Generate additional colors by varying hue
                    for (let i = baseColors.length; i < count; i++) {
                        const hue = (i * 137) % 360; // Use golden angle approximation for good distribution
                        const saturation = 70 + (i % 3) * 10; // Vary saturation slightly
                        const lightness = 60 + (i % 5) * 5; // Vary lightness slightly
                        colors.push(`hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`);
                    }
                    
                    return colors;
                }
            };
            
            const chartData = {
                labels: question.options.map(option => option.text),
                datasets: [
                    {
                        data: question.options.map(option => option.count),
                        backgroundColor: generateColors(question.options.length),
                        borderWidth: 1,
                    },
                ],
            };

            return (
                <div style={{ height: '300px', position: 'relative' }}>
                    <Pie 
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'right',
                                    display: question.options.length <= 15, // Hide legend if too many options
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const label = context.label || '';
                                            const value = context.raw as number;
                                            const percentage = question.options[context.dataIndex]?.percentage || 0;
                                            return `${label}: ${value} (${percentage}%)`;
                                        }
                                    }
                                }
                            }
                        }}
                    />
                </div>
            );
        }
    };

    if (status === "loading" || loading) {
        return <Loading />;
    }

    return (
        <DashboardLayout>
            <AntTitle level={2}>Event Overview</AntTitle>

            {/* Main statistics */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Total Registered"
                            value={dashboardData.totalRegistered}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Students"
                            value={dashboardData.studentCount}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Lecturers"
                            value={dashboardData.lecturerCount}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Attendance Rate"
                            value={dashboardData.attendedRate}
                            prefix={<CheckCircleOutlined />}
                            suffix="%"
                            precision={2}
                        />
                    </Card>
                </Col>
            </Row>  
            
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Attended Count"
                            value={dashboardData.attendedCount}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Survey Results Section */}
            <Card style={{ marginTop: '24px' }}>
                <AntTitle level={3}>Survey Results</AntTitle>
                
                {!dashboardData.surveyQuestions || dashboardData.surveyQuestions.length === 0 ? (
                    <Text>No survey data available</Text>
                ) : (
                    <>
                        <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                            <Button 
                                type="primary" 
                                icon={<DownloadOutlined />} 
                                onClick={exportAllToExcel}
                            >
                                Export Survey Results
                            </Button>
                        </div>
                        <Row gutter={[16, 16]}>
                            {dashboardData.surveyQuestions.map((question, index) => (
                                <Col xs={24} md={24} xl={24} key={index}>
                                    <Card 
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Question {index + 1}</span>
                                                {/* <Button 
                                                    type="primary"
                                                    size="small"
                                                    icon={<DownloadOutlined />} 
                                                    onClick={() => exportToExcel(question)}
                                                >
                                                    Export
                                                </Button> */}
                                            </div>
                                        }
                                    >
                                        <div style={{ height: question.type === 'TEXT' ? 'auto' : '300px' }}>
                                            {renderChartForQuestion(question)}
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}
            </Card>
        </DashboardLayout>
    );
}
