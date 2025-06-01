import { Tag, Button, Modal, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { EventStatus } from '../../list/model/types';
import { EVENT_STATUS_COLORS } from '../../list/lib/constants';
import { updateEventStatus } from '../model/api';
import styles from './EventStatusUpdate.module.css';
import { useState } from 'react';

interface EventStatusUpdateProps {
    departmentCode: string;
    eventId: number;
    currentStatus: EventStatus;
    onStatusChange?: (newStatus: EventStatus) => void;
}

const STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
    DRAFT: ['PUBLISHED'],
    PUBLISHED: ['BLOCKED', 'CANCELLED', 'CLOSED'],
    BLOCKED: ['PUBLISHED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
    CLOSED: []
};

export function EventStatusUpdate({ departmentCode, eventId, currentStatus, onStatusChange }: EventStatusUpdateProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(null);

    const handleStatusChange = async (newStatus: EventStatus) => {
        try {
            await updateEventStatus(departmentCode, eventId, newStatus);
            message.success('Event status has been updated successfully');
            onStatusChange?.(newStatus);
            setIsModalOpen(false);
            setSelectedStatus(null);
        } catch (error) {
            message.error('Failed to update event status');
            console.error('Error updating event status:', error);
        }
    };

    const availableStatuses = STATUS_TRANSITIONS[currentStatus] || [];

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedStatus(null);
    };

    const handleConfirm = () => {
        if (selectedStatus) {
            handleStatusChange(selectedStatus);
        }
    };

    return (
        <div className={styles.statusContainer}>

            <div className={styles.currentStatus}>

                <Tag color={EVENT_STATUS_COLORS[currentStatus]} className={styles.statusTag}>
                    {currentStatus}
                </Tag>
                {availableStatuses.length > 0 && (
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={showModal}
                        className={styles.editButton}
                    />
                )}
            </div>

            <Modal
                title="Update Event Status"
                open={isModalOpen}
                onOk={handleConfirm}
                onCancel={handleCancel}
                okText="Confirm"
                cancelText="Cancel"
                okButtonProps={{ disabled: !selectedStatus }}
            >
                <div className={styles.statusOptions}>
                    {availableStatuses.map(status => (
                        <Tag
                            key={status}
                            color={EVENT_STATUS_COLORS[status]}
                            className={`${styles.statusTag} ${selectedStatus === status ? styles.selected : ''}`}
                            onClick={() => setSelectedStatus(status)}
                            style={{ cursor: 'pointer' }}
                        >
                            {status}
                        </Tag>
                    ))}
                </div>
            </Modal>
        </div>
    );
} 