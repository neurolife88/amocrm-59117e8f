
import { useState } from 'react';
import { PatientData, FieldGroup } from '@/types/patient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Edit2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PatientTableDesktopProps {
  patients: PatientData[];
  visibleFieldGroups: FieldGroup[];
  onPatientUpdate: (dealId: number, updates: Partial<PatientData>) => Promise<void>;
  userRole: 'super_admin' | 'director' | 'coordinator';
}

export function PatientTableDesktop({ 
  patients, 
  visibleFieldGroups, 
  onPatientUpdate, 
  userRole 
}: PatientTableDesktopProps) {
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<{ dealId: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEditing = (dealId: number, field: string, currentValue: string) => {
    setEditingField({ dealId, field });
    setEditValue(currentValue || '');
  };

  const saveEdit = async (dealId: number, field: string) => {
    try {
      const updates: Partial<PatientData> = {};
      
      if (field === 'apartment_number') {
        updates.apartment_number = editValue;
      } else if (field === 'departure_city') {
        updates.departure_city = editValue;
      } else if (field === 'departure_datetime') {
        updates.departure_datetime = editValue;
      } else if (field === 'departure_flight_number') {
        updates.departure_flight_number = editValue;
      }

      await onPatientUpdate(dealId, updates);
      setEditingField(null);
      toast({
        title: "Успешно обновлено",
        description: "Данные пациента обновлены",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const isEditing = (dealId: number, field: string) => {
    return editingField?.dealId === dealId && editingField?.field === field;
  };

  const canEdit = (field: string) => {
    return userRole === 'coordinator' && ['apartment_number', 'departure_city', 'departure_datetime', 'departure_flight_number'].includes(field);
  };

  const renderEditableCell = (patient: PatientData, field: string, value: string | null, formatValue?: (val: string | null) => string) => {
    const displayValue = formatValue ? formatValue(value) : (value || '-');
    const rawValue = value || '';

    if (isEditing(patient.deal_id, field)) {
      return (
        <TableCell>
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => saveEdit(patient.deal_id, field)}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelEdit}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      );
    }

    return (
      <TableCell>
        <div className="flex items-center justify-between group">
          <span>{displayValue}</span>
          {canEdit(field) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => startEditing(patient.deal_id, field, rawValue)}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </TableCell>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const variants = {
      'Arriving': 'default',
      'In Treatment': 'secondary',
      'Departed': 'outline',
      'Unknown': 'destructive'
    } as const;

    const labels = {
      'Arriving': 'Прибывает',
      'In Treatment': 'На лечении',
      'Departed': 'Отбыл',
      'Unknown': 'Неизвестно'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getVisaBadge = (visaStatus: string | null, daysUntilExpires: number | null) => {
    if (!visaStatus) return null;

    const variants = {
      'Active': 'default',
      'Expiring Soon': 'destructive',
      'Expired': 'destructive'
    } as const;

    const labels = {
      'Active': 'Активна',
      'Expiring Soon': 'Истекает',
      'Expired': 'Истекла'
    };

    return (
      <div className="space-y-1">
        <Badge variant={variants[visaStatus as keyof typeof variants] || 'outline'}>
          {labels[visaStatus as keyof typeof labels] || visaStatus}
        </Badge>
        {daysUntilExpires !== null && (
          <div className="text-xs text-muted-foreground">
            {daysUntilExpires > 0 
              ? `${daysUntilExpires} дней` 
              : daysUntilExpires === 0 
                ? 'Истекает сегодня' 
                : `Просрочено на ${Math.abs(daysUntilExpires)} дней`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Basic fields */}
            {visibleFieldGroups.includes('basic') && (
              <>
                <TableHead>Пациент</TableHead>
                <TableHead>Клиника</TableHead>
                <TableHead>Статус</TableHead>
              </>
            )}
            
            {/* Arrival fields */}
            {visibleFieldGroups.includes('arrival') && (
              <>
                <TableHead>Прибытие</TableHead>
                <TableHead>Транспорт</TableHead>
                <TableHead>Рейс</TableHead>
                <TableHead>Квартира</TableHead>
              </>
            )}
            
            {/* Departure fields */}
            {visibleFieldGroups.includes('departure') && (
              <>
                <TableHead>Отъезд</TableHead>
                <TableHead>Город отъезда</TableHead>
                <TableHead>Рейс отъезда</TableHead>
              </>
            )}
            
            {/* Visa fields */}
            {visibleFieldGroups.includes('visa') && (
              <>
                <TableHead>Виза</TableHead>
                <TableHead>Истекает</TableHead>
              </>
            )}
            
            {/* Personal fields (super admin only) */}
            {visibleFieldGroups.includes('personal') && userRole === 'super_admin' && (
              <>
                <TableHead>Телефон</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Паспорт</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.deal_id}>
              {/* Basic fields */}
              {visibleFieldGroups.includes('basic') && (
                <>
                  <TableCell className="font-medium">
                    {patient.patient_full_name || '-'}
                  </TableCell>
                  <TableCell>{patient.clinic_name || '-'}</TableCell>
                  <TableCell>{getStatusBadge(patient.patient_status)}</TableCell>
                </>
              )}
              
              {/* Arrival fields */}
              {visibleFieldGroups.includes('arrival') && (
                <>
                  <TableCell>{formatDate(patient.arrival_datetime)}</TableCell>
                  <TableCell>{patient.arrival_transport_type || '-'}</TableCell>
                  <TableCell>{patient.arrival_flight_number || '-'}</TableCell>
                  {renderEditableCell(patient, 'apartment_number', patient.apartment_number)}
                </>
              )}
              
               {/* Departure fields */}
               {visibleFieldGroups.includes('departure') && (
                 <>
                   {renderEditableCell(patient, 'departure_datetime', patient.departure_datetime, formatDate)}
                   {renderEditableCell(patient, 'departure_city', patient.departure_city)}
                   {renderEditableCell(patient, 'departure_flight_number', patient.departure_flight_number)}
                 </>
               )}
              
              {/* Visa fields */}
              {visibleFieldGroups.includes('visa') && (
                <>
                  <TableCell>{patient.visa_type || '-'}</TableCell>
                  <TableCell>
                    {getVisaBadge(patient.visa_status, patient.days_until_visa_expires)}
                  </TableCell>
                </>
              )}
              
              {/* Personal fields (super admin only) */}
              {visibleFieldGroups.includes('personal') && userRole === 'super_admin' && (
                <>
                  <TableCell>{patient.patient_phone || '-'}</TableCell>
                  <TableCell>{patient.patient_email || '-'}</TableCell>
                  <TableCell>{patient.patient_passport || '-'}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
