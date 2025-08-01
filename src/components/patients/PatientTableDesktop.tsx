
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
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

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
                  <TableCell>{patient.apartment_number || '-'}</TableCell>
                </>
              )}
              
              {/* Departure fields */}
              {visibleFieldGroups.includes('departure') && (
                <>
                  <TableCell>{formatDate(patient.departure_datetime)}</TableCell>
                  <TableCell>{patient.departure_city || '-'}</TableCell>
                  <TableCell>{patient.departure_flight_number || '-'}</TableCell>
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
