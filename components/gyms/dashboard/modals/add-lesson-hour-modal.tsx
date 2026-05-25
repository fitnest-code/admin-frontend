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
import { Calendar as CalendarIcon, Loader2, Clock, ChevronDown } from 'lucide-react'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

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
    const [showSuccess, setShowSuccess] = useState(false)
    const [startDropdown, setStartDropdown] = useState(false)
    const [endDropdown, setEndDropdown] = useState(false)

    const activeRef = (node: HTMLButtonElement | null) => {
        if (node) {
            const parent = node.parentElement;
            if (parent) {
                // Scroll the parent container so the active node is at the top
                parent.scrollTop = node.offsetTop;
            }
        }
    };

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
        if (selectedLessonType === ltId) {
            setSelectedLessonType(null)
        } else {
            setSelectedLessonType(ltId)
            // Check if selectedTrainer has this lesson type, otherwise reset
            if (selectedTrainer) {
                const tr = allTrainers.find((t: any) => String(t.trainer_id || t.id) === String(selectedTrainer))
                if (!tr || !tr.lessonTypeIds?.includes(ltId)) {
                    setSelectedTrainer(null)
                }
            }
        }
    }

    const handleSubmit = () => {
        if (!date) {
            alert('Zəhmət olmasa tarix seçin')
            return
        }

        addMutation.mutate({
            gymId,
            payload: {
                trainerId: selectedTrainer ? Number(selectedTrainer) : null,
                lessonTypeId: selectedLessonType || null,
                date,
                startTime,
                endTime,
                maxSlots
            }
        }, {
            onSuccess: () => setShowSuccess(true)
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
                        <h3 className={styles.sectionTitle}>Məşqi seçin (İstəyə bağlı)</h3>
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
                                    onClick={() => {
                                        if (selectedTrainer === (trainer.trainer_id || trainer.id)) {
                                            setSelectedTrainer(null);
                                        } else {
                                            setSelectedTrainer(trainer.trainer_id || trainer.id);
                                        }
                                    }}
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
                                        <div className={styles.trainerRole}>{trainer.profession?.name || trainer.professionName || 'Məşqi'}</div>
                                    </div>
                                </div>
                            ))}
                            {!trainersLoading && currentTrainers.length === 0 && (
                                <p className={styles.emptyText}>
                                    Bu dərs növü üzrə məşqi tapılmadı
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
                                    <>
                                        <div className="fixed inset-0 z-50" onClick={() => setShowCalendar(false)} />
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
                                    </>
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
                            <div className="relative w-full">
                                <button
                                    type="button"
                                    onClick={() => { setStartDropdown(!startDropdown); setEndDropdown(false); }}
                                    className={cn(
                                        styles.input,
                                        "w-full flex items-center justify-between text-sm font-medium bg-white hover:border-[#00B4CC80] transition-colors"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-[#00B4CC]" />
                                        <span>{startTime}</span>
                                    </div>
                                    <ChevronDown size={14} className="text-slate-400" />
                                </button>
                                 {startDropdown && (
                                     <>
                                         <div className="fixed inset-0 z-50" onClick={() => setStartDropdown(false)} />
                                         <div className="absolute top-full left-0 right-0 z-[60] mt-1 border border-[#E5E7EB] rounded-2xl shadow-xl bg-white overflow-hidden">
                                             <div className={styles.frameParent}>
                                                 <div className={styles.columnsContainer}>
                                                     {/* Hours Column */}
                                                     <div className={styles.column}>
                                                         {HOURS.map(h => {
                                                             const currentH = startTime.split(':')[0] || '09';
                                                             const currentM = startTime.split(':')[1] || '00';
                                                             const isSelected = h === currentH;
                                                             return (
                                                                 <button
                                                                     key={h}
                                                                     type="button"
                                                                     ref={isSelected ? activeRef : undefined}
                                                                     onClick={() => setStartTime(`${h}:${currentM}`)}
                                                                     className={isSelected ? cn(styles.wrapper, styles.frameGroup) : styles.frame}
                                                                 >
                                                                     <div className={styles.div}>{h}</div>
                                                                 </button>
                                                             );
                                                         })}
                                                     </div>
                                                     
                                                     {/* Minutes Column */}
                                                     <div className={styles.column}>
                                                         {MINUTES.map(m => {
                                                             const currentH = startTime.split(':')[0] || '09';
                                                             const currentM = startTime.split(':')[1] || '00';
                                                             const isSelected = m === currentM;
                                                             return (
                                                                 <button
                                                                     key={m}
                                                                     type="button"
                                                                     ref={isSelected ? activeRef : undefined}
                                                                     onClick={() => setStartTime(`${currentH}:${m}`)}
                                                                     className={isSelected ? cn(styles.wrapper, styles.frameGroup) : styles.frame}
                                                                 >
                                                                     <div className={styles.div}>{m}</div>
                                                                 </button>
                                                             );
                                                         })}
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </>
                                 )}
                             </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Bitmə saatı</label>
                            <div className="relative w-full">
                                <button
                                    type="button"
                                    onClick={() => { setEndDropdown(!endDropdown); setStartDropdown(false); }}
                                    className={cn(
                                        styles.input,
                                        "w-full flex items-center justify-between text-sm font-medium bg-white hover:border-[#00B4CC80] transition-colors"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-[#00B4CC]" />
                                        <span>{endTime}</span>
                                    </div>
                                    <ChevronDown size={14} className="text-slate-400" />
                                </button>
                                {endDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-50" onClick={() => setEndDropdown(false)} />
                                        <div className="absolute top-full left-0 right-0 z-[60] mt-1 border border-[#E5E7EB] rounded-2xl shadow-xl bg-white overflow-hidden">
                                            <div className={styles.frameParent}>
                                                <div className={styles.columnsContainer}>
                                                    {/* Hours Column */}
                                                    <div className={styles.column}>
                                                        {HOURS.map(h => {
                                                            const currentH = endTime.split(':')[0] || '10';
                                                            const currentM = endTime.split(':')[1] || '00';
                                                            const isSelected = h === currentH;
                                                            return (
                                                                <button
                                                                    key={h}
                                                                    type="button"
                                                                    ref={isSelected ? activeRef : undefined}
                                                                    onClick={() => setEndTime(`${h}:${currentM}`)}
                                                                    className={isSelected ? cn(styles.wrapper, styles.frameGroup) : styles.frame}
                                                                >
                                                                    <div className={styles.div}>{h}</div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    
                                                    {/* Minutes Column */}
                                                    <div className={styles.column}>
                                                        {MINUTES.map(m => {
                                                            const currentH = endTime.split(':')[0] || '10';
                                                            const currentM = endTime.split(':')[1] || '00';
                                                            const isSelected = m === currentM;
                                                            return (
                                                                <button
                                                                    key={m}
                                                                    type="button"
                                                                    ref={isSelected ? activeRef : undefined}
                                                                    onClick={() => setEndTime(`${currentH}:${m}`)}
                                                                    className={isSelected ? cn(styles.wrapper, styles.frameGroup) : styles.frame}
                                                                >
                                                                    <div className={styles.div}>{m}</div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>Ləğv et</button>
                    <button className={styles.saveBtn} onClick={handleSubmit}>
                        {addMutation.isPending ? 'Gözləyin...' : 'Yadda saxla'}
                    </button>
                </div>
            </div>
            
            <SuccessAnimationModal 
                isOpen={showSuccess} 
                onClose={() => {
                    setShowSuccess(false);
                    onClose();
                }} 
                message="Dərs saatı uğurla yaradıldı"
            />
        </div>
    )
}
