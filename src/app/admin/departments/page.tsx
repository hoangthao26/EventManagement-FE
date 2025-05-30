"use client"

import DashboardLayout from "@/widgets/layouts/ui/DashboardLayout";
import { Table } from "antd";
import { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "@/features/auth/model/useAuth";
import axios from "axios";
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
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/departments`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                }   
            })
            const data = await response.data
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