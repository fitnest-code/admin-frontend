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
import { format, parse, addDays, eachDayOfInterval, endOfMonth, getDay } from 'date-fns'
import { Calendar as CalendarIcon, Loader2, Clock, Sparkles } from 'lucide-react'
import { SuccessAnimationModal } from '@/components/ui/success-animation-modal'
import { useT } from '@/lib/i18n'

interface Props {
    gymId: number
    onClose: () => void
}

type ScheduleMode = 'single' | 'week' | 'month' | 'custom'

const DAYS_OF_WEEK = [
    { label: 'B.E', value: 1 },
    { label: 'Ç.Ə', value: 2 },
    { label: 'Ç.',  value: 3 },
    { label: 'Ç.A', value: 4 },
    { label: 'C.',  value: 5 },
    { label: 'C.Ə', value: 6 },
    { label: 'B.',  value: 0 },
]

export const AddLessonHourModal = ({ gymId, onClose }: Props) => {
    const t = useT()
    const [selectedLessonType, setSelectedLessonType] = useState<number | null>(null)
    const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null)
    
    // Schedule Mode: single date, whole week, whole month, custom range
    const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('single')
    const [date, setDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5, 6, 0])

    const [showCalendar, setShowCalendar] = useState(false)
    const [showEndCalendar, setShowEndCalendar] = useState(false)
    const [showStartPicker, setShowStartPicker] = useState(false)
    const [showEndPicker, setShowEndPicker] = useState(false)
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('10:00')
    const [maxSlots, setMaxSlots] = useState<number | ''>('')
    const [showSuccess, setShowSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitProgress, setSubmitProgress] = useState<{ current: number; total: number } | null>(null)

    // Lesson types come from the gym's categories: every lesson type of every
    // category assigned to the gym is available (ids are global lesson type ids)
    const { data: lessonTypesData } = useGymLessonTypes(gymId)
    const availableLessonTypes = lessonTypesData || []

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

    const getDatesToCreate = (): string[] => {
        if (scheduleMode === 'single') {
            return date ? [date] : []
        }

        if (!date) return []

        const startObj = parse(date, 'yyyy-MM-dd', new Date())
        if (isNaN(startObj.getTime())) return []

        let endObj: Date
        if (scheduleMode === 'week') {
            endObj = addDays(startObj, 6)
        } else if (scheduleMode === 'month') {
            endObj = endOfMonth(startObj)
        } else if (scheduleMode === 'custom') {
            if (!endDate) return []
            endObj = parse(endDate, 'yyyy-MM-dd', new Date())
            if (isNaN(endObj.getTime()) || endObj < startObj) return []
        } else {
            return []
        }

        try {
            const intervalDays = eachDayOfInterval({ start: startObj, end: endObj })
            return intervalDays
                .filter((d) => selectedDaysOfWeek.includes(getDay(d)))
                .map((d) => format(d, 'yyyy-MM-dd'))
        } catch {
            return []
        }
    }

    const datesToCreate = getDatesToCreate()

    const handleSubmit = async () => {
        if (!selectedLessonType) {
            alert('Zəhmət olmasa dərs növünü seçin')
            return
        }
        if (datesToCreate.length === 0) {
            alert(t.lessonHours.dateRequiredAlert || 'Zəhmət olmasa tarixi seçin')
            return
        }
        if (maxSlots === '') {
            alert('Zəhmət olmasa yer sayını qeyd edin')
            return
        }

        setIsSubmitting(true)
        try {
            for (let i = 0; i < datesToCreate.length; i++) {
                setSubmitProgress({ current: i + 1, total: datesToCreate.length })
                await addMutation.mutateAsync({
                    gymId,
                    payload: {
                        trainerId: selectedTrainer ? Number(selectedTrainer) : null,
                        lessonTypeId: selectedLessonType || null,
                        date: datesToCreate[i],
                        startTime,
                        endTime,
                        maxSlots
                    }
                })
            }
            setShowSuccess(true)
        } catch (err: any) {
            alert(err?.message || 'Dərs saatı yaradılarkən xəta baş verdi')
        } finally {
            setIsSubmitting(false)
            setSubmitProgress(null)
        }
    }

    const selectedDateObj = date ? parse(date, 'yyyy-MM-dd', new Date()) : undefined
    const selectedEndDateObj = endDate ? parse(endDate, 'yyyy-MM-dd', new Date()) : undefined

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={cn(styles.modal, "max-h-[92vh] overflow-y-auto")}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{t.lessonHours.addModalTitle}</h2>
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
                                <p className={styles.emptyText}>{t.lessonHours.noClassTypes}</p>
                            )}
                        </div>
                    </div>

                    {/* Trainer Selection */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>{t.lessonHours.selectTrainerLabel}</h3>
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
                                        <div className={styles.trainerRole}>{trainer.profession?.name || trainer.professionName || t.lessonHours.trainer}</div>
                                    </div>
                                </div>
                            ))}
                            {!trainersLoading && currentTrainers.length === 0 && (
                                <p className={styles.emptyText}>
                                    {t.lessonHours.noTrainersFound}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Schedule Templates / Date Mode Selector */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>{(t.lessonHours as any).templateLabel || 'Tarix şablonu'}</h3>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'single', label: (t.lessonHours as any).modeSingle || 'Tək gün' },
                                { id: 'week', label: (t.lessonHours as any).modeWeek || 'Bütöv həftə (7 gün)' },
                                { id: 'month', label: (t.lessonHours as any).modeMonth || 'Bütöv ay' },
                                { id: 'custom', label: (t.lessonHours as any).modeCustom || 'Xüsusi interval' }
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium rounded-xl border transition-all cursor-pointer",
                                        scheduleMode === m.id
                                            ? "bg-[#00B4CC]/10 border-[#00B4CC] text-[#00B4CC] font-semibold"
                                            : "bg-[#FAFAFA] border-[#ECECED] text-slate-700 hover:bg-slate-100"
                                    )}
                                    onClick={() => setScheduleMode(m.id as ScheduleMode)}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Days of Week Filter (when template mode is week/month/custom) */}
                    {scheduleMode !== 'single' && (
                        <div className={styles.section}>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">
                                {(t.lessonHours as any).daysOfWeekLabel || 'Tətbiq ediləcək günlər'}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {DAYS_OF_WEEK.map((day) => {
                                    const isSelected = selectedDaysOfWeek.includes(day.value);
                                    return (
                                        <button
                                            key={day.value}
                                            type="button"
                                            className={cn(
                                                "w-10 h-10 rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer",
                                                isSelected
                                                    ? "bg-[#00B4CC] border-[#00B4CC] text-white shadow-sm"
                                                    : "bg-[#FAFAFA] border-[#ECECED] text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                            )}
                                            onClick={() => {
                                                if (isSelected) {
                                                    if (selectedDaysOfWeek.length > 1) {
                                                        setSelectedDaysOfWeek(selectedDaysOfWeek.filter((d) => d !== day.value));
                                                    }
                                                } else {
                                                    setSelectedDaysOfWeek([...selectedDaysOfWeek, day.value]);
                                                }
                                            }}
                                        >
                                            {day.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Date and Slots */}
                    <div className={cn(styles.row, "relative", (showCalendar || showEndCalendar) ? "z-30" : "z-20")}>
                        <div className={cn(styles.inputGroup, "relative")}>
                            <label className={styles.label}>
                                {scheduleMode === 'single'
                                    ? t.lessonHours.date
                                    : (t.lessonHours as any).startDateLabel || 'Başlama tarixi'}
                            </label>
                            <div className="relative">
                                <button 
                                    onClick={() => {
                                        setShowCalendar(!showCalendar);
                                        setShowEndCalendar(false);
                                        setShowStartPicker(false);
                                        setShowEndPicker(false);
                                    }}
                                    className={cn(
                                        styles.input,
                                        "flex items-center justify-between gap-2 text-left bg-white"
                                    )}
                                >
                                    <span className={cn(!date && "text-slate-400")}>
                                        {date ? format(selectedDateObj!, 'dd.MM.yyyy') : t.lessonHours.datePlaceholder}
                                    </span>
                                    <CalendarIcon size={18} className="text-slate-400" />
                                </button>

                                {showCalendar && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
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

                        {/* End Date (Only for Custom Interval) */}
                        {scheduleMode === 'custom' && (
                            <div className={cn(styles.inputGroup, "relative")}>
                                <label className={styles.label}>
                                    {(t.lessonHours as any).endDateLabel || 'Bitmə tarixi'}
                                </label>
                                <div className="relative">
                                    <button 
                                        onClick={() => {
                                            setShowEndCalendar(!showEndCalendar);
                                            setShowCalendar(false);
                                            setShowStartPicker(false);
                                            setShowEndPicker(false);
                                        }}
                                        className={cn(
                                            styles.input,
                                            "flex items-center justify-between gap-2 text-left bg-white"
                                        )}
                                    >
                                        <span className={cn(!endDate && "text-slate-400")}>
                                            {endDate ? format(selectedEndDateObj!, 'dd.MM.yyyy') : t.lessonHours.datePlaceholder}
                                        </span>
                                        <CalendarIcon size={18} className="text-slate-400" />
                                    </button>

                                    {showEndCalendar && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowEndCalendar(false)} />
                                            <div className="absolute top-full left-0 z-[60] mt-1">
                                                <CustomCalendar 
                                                    selectedDate={selectedEndDateObj}
                                                    onSelect={(d) => {
                                                        setEndDate(format(d, 'yyyy-MM-dd'))
                                                        setShowEndCalendar(false)
                                                    }}
                                                    onClose={() => setShowEndCalendar(false)}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>{t.lessonHours.places} ( max. 12 )</label>
                            <input 
                                type="number" 
                                className={styles.input} 
                                value={maxSlots}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        setMaxSlots('');
                                    } else {
                                        const num = parseInt(val, 10);
                                        if (!isNaN(num)) {
                                            setMaxSlots(num);
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Times */}
                    <div className={cn(styles.row, "relative", (showStartPicker || showEndPicker) ? "z-30" : "z-10")}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>{t.lessonHours.startTimeLabel}</label>
                            <div className="relative">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowStartPicker(!showStartPicker);
                                        setShowEndPicker(false);
                                        setShowCalendar(false);
                                        setShowEndCalendar(false);
                                    }}
                                    className={cn(
                                        styles.input,
                                        "flex items-center justify-between gap-2 text-left bg-white"
                                    )}
                                >
                                    <span>{startTime}</span>
                                    <Clock size={18} className="text-[#00B4CC]" />
                                </button>

                                {showStartPicker && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowStartPicker(false)} />
                                        <div className="absolute top-full left-0 z-[60] mt-1 w-full max-w-[286px] bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <TimePicker 
                                                value={startTime}
                                                onChange={(val) => {
                                                    setStartTime(val);
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>{t.lessonHours.endTimeLabel}</label>
                            <div className="relative">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setShowEndPicker(!showEndPicker);
                                        setShowStartPicker(false);
                                        setShowCalendar(false);
                                        setShowEndCalendar(false);
                                    }}
                                    className={cn(
                                        styles.input,
                                        "flex items-center justify-between gap-2 text-left bg-white"
                                    )}
                                >
                                    <span>{endTime}</span>
                                    <Clock size={18} className="text-[#00B4CC]" />
                                </button>

                                {showEndPicker && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowEndPicker(false)} />
                                        <div className="absolute top-full left-0 z-[60] mt-1 w-full max-w-[286px] bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                            <TimePicker 
                                                value={endTime}
                                                onChange={(val) => {
                                                    setEndTime(val);
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Badge for Bulk Creation */}
                    {scheduleMode !== 'single' && datesToCreate.length > 0 && (
                        <div className="bg-[#00B4CC]/10 border border-[#00B4CC]/30 rounded-xl p-3 text-sm text-[#00B4CC] font-medium flex items-center gap-2">
                            <Sparkles size={16} className="shrink-0" />
                            <span>
                                {((t.lessonHours as any).totalHoursBadge || 'Toplam {count} dərs saatı yaradılacaq').replace('{count}', String(datesToCreate.length))}
                            </span>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
                        {t.lessonHours.cancelBtn}
                    </button>
                    <button className={styles.saveBtn} onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting
                            ? `Yaradılır (${submitProgress?.current}/${submitProgress?.total})...`
                            : t.lessonHours.saveBtn}
                    </button>
                </div>
            </div>
            
            <SuccessAnimationModal 
                isOpen={showSuccess} 
                onClose={() => {
                    setShowSuccess(false);
                    onClose();
                }} 
                message={t.lessonHours.createSuccess}
            />
        </div>
    )
}

interface TimePickerProps {
    value: string;
    onChange: (value: string) => void;
}

const TimePickerList = ({ items, selectedValue, onChange }: { items: string[], selectedValue: string, onChange: (val: string) => void }) => {
    const listRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (listRef.current) {
            const activeEl = listRef.current.querySelector('[data-active="true"]');
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'center', behavior: 'auto' });
            }
        }
    }, [selectedValue]);

    return (
        <>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                }
            `}</style>
            <div 
                ref={listRef} 
                className={cn(styles.timePickerList, "hide-scrollbar")}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {items.map((item) => {
                    const isSelected = item === selectedValue;
                    return (
                        <button
                            key={item}
                            type="button"
                            data-active={isSelected ? "true" : "false"}
                            onClick={() => onChange(item)}
                            className={cn(
                                styles.timePickerItem,
                                isSelected ? styles.timePickerItemActive : styles.timePickerItemInactive
                            )}
                        >
                            {item}
                        </button>
                    );
                })}
            </div>
        </>
    );
};

const TimePicker = ({ value, onChange }: TimePickerProps) => {
    const [hVal, mVal] = value.split(':');
    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    return (
        <div className={styles.timePickerContainer}>
            <div className={styles.timePickerColumn}>
                <TimePickerList 
                    items={hours} 
                    selectedValue={hVal} 
                    onChange={(h) => onChange(`${h}:${mVal}`)} 
                />
            </div>
            <div className={styles.timePickerColumn}>
                <TimePickerList 
                    items={minutes} 
                    selectedValue={mVal} 
                    onChange={(m) => onChange(`${hVal}:${m}`)} 
                />
            </div>
        </div>
    );
};

