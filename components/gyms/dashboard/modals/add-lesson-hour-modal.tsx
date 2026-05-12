'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import styles from './add-lesson-hour-modal.module.css'
import { cn } from '@/lib/utils'
import { 
    useAddLessonHour, 
    useGymTrainers, 
    useCategories,
    useGymDetailsAdmin
} from '@/lib/query/gym-query'
import { CustomCalendar } from '@/components/ui/custom-calendar'
import { format, parse } from 'date-fns'
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react'

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

    // Fetch gym details & categories to extract all lesson types belonging to the gym's category
    const { data: gymDetails } = useGymDetailsAdmin(gymId)
    const { data: categoriesData } = useCategories()
    const activeCategoryId = gymDetails?.categoryId
    const selectedCategory = categoriesData?.items?.find((c: any) => c.id === activeCategoryId)
    const availableLessonTypes = selectedCategory?.lessonTypes || []

    // Fetch all trainers without strict pagination to filter properly client-side
    const { data: trainersData, isLoading: trainersLoading } = useGymTrainers(gymId, { 
        page: 1, 
        pageSize: 100 
    })
    
    const allTrainers = trainersData?.items || []
    
    // Filter trainers available for selectedLessonType
    const currentTrainers = selectedLessonType 
        ? allTrainers.filter((t: any) => t.lessonTypeIds?.includes(selectedLessonType))
        : allTrainers

    const addMutation = useAddLessonHour()

    const handleLessonTypeSelect = (ltId: number) => {
        setSelectedLessonType(ltId)
        // Check if selectedTrainer has this lesson type, otherwise reset
        if (selectedTrainer) {
            const tr = allTrainers.find((t: any) => String(t.trainer_id || t.id) === String(selectedTrainer))
            if (!tr || !tr.lessonTypeIds?.includes(ltId)) {
                setSelectedTrainer(null)
            }
        }
    }

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
                            {availableLessonTypes.map((type: any) => (
                                <div 
                                    key={type.id}
                                    className={`${styles.lessonTypeCard} ${selectedLessonType === type.id ? styles.selected : ''}`}
                                    onClick={() => handleLessonTypeSelect(type.id)}
                                >
                                    {type.name}
                                </div>
                            ))}
                            {availableLessonTypes.length === 0 && (
                                <p className={styles.emptyText}>Dərs növü tapılmadı</p>
                            )}
                        </div>
                    </div>

                    {/* Trainer Selection */}
                    <div className={styles.section}>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className={styles.sectionTitle}>Məşqçi seçin</h3>
                            {selectedLessonType && (
                                <span className="text-xs font-medium text-[#00b4cc] bg-[#00b4cc]/10 px-2 py-1 rounded">
                                    Seçilmiş dərs növü üzrə filtrlənib
                                </span>
                            )}
                        </div>
                        <div className={cn(styles.trainersList, "max-h-[220px] overflow-y-auto relative p-1")}>
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
                            {!trainersLoading && currentTrainers.length === 0 && (
                                <p className={styles.emptyText}>
                                    {selectedLessonType 
                                        ? "Bu dərs növü üzrə məşqçi tapılmadı" 
                                        : "Məşqçi tapılmadı"}
                                </p>
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
