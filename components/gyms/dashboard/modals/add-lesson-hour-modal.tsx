'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import styles from './add-lesson-hour-modal.module.css'
import { 
    useAddLessonHour, 
    useGymTrainers, 
    useGymLessonTypes 
} from '@/lib/query/gym-query'

interface Props {
    gymId: number
    onClose: () => void
}

export const AddLessonHourModal = ({ gymId, onClose }: Props) => {
    const [selectedLessonType, setSelectedLessonType] = useState<number | null>(null)
    const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null)
    const [date, setDate] = useState('')
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('10:00')
    const [maxSlots, setMaxSlots] = useState(12)

    const { data: trainers } = useGymTrainers(gymId)
    const { data: lessonTypes } = useGymLessonTypes(gymId)
    const addMutation = useAddLessonHour()

    const handleSubmit = () => {
        if (!selectedLessonType || !selectedTrainer || !date) {
            alert('Zəhmət olmasa bütün xanaları doldurun')
            return
        }

        addMutation.mutate({
            gymId,
            payload: {
                trainerId: Number(selectedTrainer),
                lessonTypeId: selectedLessonType,
                date,
                startTime,
                endTime,
                maxSlots
            }
        }, {
            onSuccess: () => onClose()
        })
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Dərs saatı məlumatları</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <Image src="/Sidebar/X.svg" width={24} height={24} alt="Close" />
                    </button>
                </div>

                <div className={styles.body}>
                    {/* Lesson Type Selection */}
                    <div className={styles.section}>
                        <div className={styles.lessonTypesList}>
                            {lessonTypes?.map((type: any) => (
                                <div 
                                    key={type.id}
                                    className={`${styles.lessonTypeCard} ${selectedLessonType === type.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedLessonType(type.id)}
                                >
                                    {type.name}
                                </div>
                            ))}
                            {(!lessonTypes || lessonTypes.length === 0) && (
                                <p className={styles.emptyText}>Dərs növü tapılmadı</p>
                            )}
                        </div>
                    </div>

                    {/* Trainer Selection */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Məşqçi seçin</h3>
                        <div className={styles.trainersList}>
                            {trainers?.items?.map((trainer: any) => (
                                <div 
                                    key={trainer.trainer_id || trainer.id}
                                    className={`${styles.trainerCard} ${selectedTrainer === (trainer.trainer_id || trainer.id) ? styles.selected : ''}`}
                                    onClick={() => setSelectedTrainer(trainer.trainer_id || trainer.id)}
                                >
                                    <div className={styles.trainerAvatar}>
                                        <Image 
                                            src={trainer.picture || trainer.photoUrl || '/Sidebar/Avatar.svg'} 
                                            width={54} height={54} alt="Avatar" 
                                            className={styles.avatarImg}
                                        />
                                    </div>
                                    <div className={styles.trainerInfo}>
                                        <div className={styles.trainerName}>{trainer.name} {trainer.surname}</div>
                                        <div className={styles.trainerRole}>{trainer.profession?.name || trainer.professionName || 'Məşqçi'}</div>
                                    </div>
                                </div>
                            ))}
                            {(!trainers?.items || trainers.items.length === 0) && (
                                <p className={styles.emptyText}>Məşqçi tapılmadı</p>
                            )}
                        </div>
                    </div>

                    {/* Date and Slots */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Tarix</label>
                            <input 
                                type="date" 
                                className={styles.input} 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Yer / Nəfər ( max. 12 )</label>
                            <input 
                                type="number" 
                                className={styles.input} 
                                value={maxSlots}
                                onChange={(e) => setMaxSlots(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Times */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Başlama saatı</label>
                            <div className={styles.timeInputWrapper}>
                                <input 
                                    type="time" 
                                    className={styles.input} 
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Bitmə saatı</label>
                            <div className={styles.timeInputWrapper}>
                                <input 
                                    type="time" 
                                    className={styles.input} 
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Ləğv et</button>
                    <button className={styles.saveBtn} onClick={handleSubmit}>Yadda saxla</button>
                </div>
            </div>
        </div>
    )
}
