import React from 'react';
import styles from '../styles/event-card.module.css';
import { Button, Tooltip, Tag } from 'antd';
import { DashboardOutlined, TeamOutlined, EditOutlined, FormOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Event } from '../model/types';
import { AUDIENCE_COLORS, MODE_COLORS } from '../lib/constants';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

interface EventCardProps {
    event: Event;
    onOverview: () => void;
    onMembers: () => void;
    onEdit: () => void;
    onSurvey: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onOverview, onMembers, onEdit, onSurvey }) => {
    const start = dayjs.utc(event.startTime).local();
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                {/* Nếu có ảnh, thay src bằng event.banner hoặc event.poster */}
                <img className={styles.image} src={event.bannerUrl} alt={event.name} />
                <div className={styles.info}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <div className={styles.title}>{event.name}</div>
                        <div className={styles.tags}>
                            <Tag color="magenta" style={{ borderRadius: 10 }}>{event.typeName}</Tag>
                            <Tag color={MODE_COLORS[event.mode] || 'default'} style={{ borderRadius: 10 }}>{event.mode}</Tag>
                            <Tag color={AUDIENCE_COLORS[event.audience] || 'default'} style={{ borderRadius: 10 }}  >
                                {event.audience === 'BOTH' ? 'STUDENT & LECTURER' : event.audience}
                            </Tag>
                        </div>
                    </div>
                    <div className={styles.time}>
                        <ClockCircleOutlined style={{ marginRight: 7, color: 'black' }} />
                        {start.format('hh:mm A, ddd, DD/MM/YYYY')}
                    </div>
                    <div className={styles.location}>
                        <EnvironmentOutlined style={{ marginRight: 6 }} />
                        {event.locationAddress}
                    </div>
                </div>
                <div className={styles.actions}>
                    <Tooltip title="Tổng quan">
                        <Button icon={<DashboardOutlined />} className={styles.actionBtn} onClick={onOverview} />
                    </Tooltip>
                    <Tooltip title="Thành viên">
                        <Button icon={<TeamOutlined />} className={styles.actionBtn} onClick={onMembers} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button icon={<EditOutlined />} className={styles.actionBtn} onClick={onEdit} />
                    </Tooltip>
                    <Tooltip title="Khảo sát">
                        <Button icon={<FormOutlined />} className={styles.actionBtn} onClick={onSurvey} />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}; 