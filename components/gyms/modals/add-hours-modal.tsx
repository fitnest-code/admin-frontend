'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddClassTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: ClassTimeData) => void;
}

export interface ClassTimeData {
  day: string;
  startTime: string;
  endTime: string;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Bazar ertəsi' },
  { value: 'tuesday', label: 'Çərşənbə axşamı' },
  { value: 'wednesday', label: 'Çərşənbə' },
  { value: 'thursday', label: 'Cümə axşamı' },
  { value: 'friday', label: 'Cümə' },
  { value: 'saturday', label: 'Şənbə' },
  { value: 'sunday', label: 'Bazar' },
];

export function AddClassTimeModal({
  open,
  onOpenChange,
  onSubmit,
}: AddClassTimeModalProps) {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');

  const handleSubmit = () => {
    if (!selectedDay || !startTime || !endTime) {
      return;
    }

    onSubmit?.({
      day: selectedDay,
      startTime,
      endTime,
    });

    // Reset form
    setSelectedDay('');
    setStartTime('09:00');
    setEndTime('10:00');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-auto rounded-2xl">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-xl font-semibold">
            Dars saati əlavə et
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Days of Week Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Haftanın günləri
            </Label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Günü seçin" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Saat</Label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full"
                />
              </div>
              <span className="text-gray-400">—</span>
              <div className="flex-1">
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg font-medium"
        >
          Əlavə et
        </Button>
      </DialogContent>
    </Dialog>
  );
}
