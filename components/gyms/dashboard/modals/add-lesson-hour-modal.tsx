'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import styles from './add-lesson-hour-modal.module.css'
import { cn } from '@/lib/utils'
import { 
    useAddLessonHour, 
    useGymTrainers, 
    useGymLessonTypes 
} from '@/lib/query/gym-query'
import { CustomCalendar } from '@/components/ui/custom-calendar'
import { format, parse } from 'date-fns'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface Props {
    gymId: number
    onClose: () => void
}

export const AddLessonHourModal = ({ gymId, onClose }: Props) => {
    const [selectedLessonType, setSelectedLessonType] = useState<number | null>(null)
    const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null)
    const [date, setDate] = useState('')
    const [showCalendar, setShowCalendar] = useState(false)
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('10:00')
    const [maxSlots, setMaxSlots] = useState(12)
    const [trainerPage, setTrainerPage] = useState(1)

    const { data: trainers, isLoading: trainersLoading } = useGymTrainers(gymId, { 
        page: trainerPage, 
        pageSize: 4 
    })
    const { data: lessonTypes } = useGymLessonTypes(gymId)
    const addMutation = useAddLessonHour()

    const trainerItems = trainers?.items || []
    const totalTrainerPages = trainers ? Math.ceil(trainers.total / 4) : 0
    const currentTrainers = trainerItems

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

    const selectedDateObj = date ? parse(date, 'yyyy-MM-dd', new Date()) : undefined

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
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
                        <div className="flex items-center justify-between mb-2">
                            <h3 className={styles.sectionTitle}>Məşqçi seçin</h3>
                            {totalTrainerPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button 
                                        disabled={trainerPage === 1}
                                        onClick={() => setTrainerPage(p => Math.max(1, p - 1))}
                                        className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span className="text-xs font-medium text-slate-500">
                                        {trainerPage} / {totalTrainerPages}
                                    </span>
                                    <button 
                                        disabled={trainerPage >= totalTrainerPages}
                                        onClick={() => setTrainerPage(p => Math.min(totalTrainerPages, p + 1))}
                                        className="p-1 rounded-full hover:bg-slate-100 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className={cn(styles.trainersList, "min-h-[140px] relative")}>
                            {trainersLoading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#00b4cc]" />
                                </div>
                            ) : null}
                            
                            {currentTrainers.map((trainer: any) => (
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
                            {!trainersLoading && trainerItems.length === 0 && (
                                <p className={styles.emptyText}>Məşqçi tapılmadı</p>
                            )}
                        </div>
                    </div>

                    {/* Date and Slots */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Tarix</label>
                            <div className="relative">
                                <button 
                                    onClick={() => setShowCalendar(!showCalendar)}
                                    className={cn(
                                        styles.input,
                                        "flex items-center justify-between gap-2 text-left bg-white"
                                    )}
                                >
                                    <span className={cn(!date && "text-slate-400")}>
                                        {date ? format(selectedDateObj!, 'dd.MM.yyyy') : 'Tarix seçin'}
                                    </span>
                                    <CalendarIcon size={18} className="text-slate-400" />
                                </button>

                                {showCalendar && (
                                    <div className="absolute top-full left-0 z-[60] mt-1">
                                        <CustomCalendar 
                                            selectedDate={selectedDateObj}
                                            onSelect={(d) => {
                                                setDate(format(d, 'yyyy-MM-dd'))
                                                setShowCalendar(false)
                                            }}
                                            onClose={() => setShowCalendar(false)}
                                        />
                                    </div>
                                )}
                            </div>
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
