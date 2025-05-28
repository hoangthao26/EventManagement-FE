"use client"

import DashboardLayout from "@/components/DashboardLayout";
import { Table } from "antd";
import { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
export default function DepartmentsPage() {
    const { session, status } = useAuth();
    const [data, setData] = useState([])
    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        }, 
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
        },
        {
            title: 'Updated At',
            dataIndex: 'updated_at',
            key: 'updated_at',
        },
        {
            title: 'Action',
            key: 'action',
        }
    ]
    
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments`)
            const data = await response.json()
            setData(data)
        }
        fetchData()
    }, [])
    return (
        <DashboardLayout>
            <h1>Departments</h1>
            <Table columns={columns} dataSource={data} />
        </DashboardLayout>
    )
}