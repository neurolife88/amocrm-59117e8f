
import { PatientData, FieldGroup } from '@/types/patient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, User, Plane, Calendar, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState } from 'react';

interface PatientCardsMobileProps {
  patients: PatientData[];
  visibleFieldGroups: FieldGroup[];
  onPatientUpdate: (dealId: number, updates: Partial<PatientData>) => Promise<void>;
  userRole: 'super_admin' | 'director' | 'coordinator';
}

export function PatientCardsMobile({ 
  patients, 
  visibleFieldGroups, 
  onPatientUpdate, 
  userRole 
}: PatientCardsMobileProps) {
  const [openCards, setOpenCards] = useState<Set<number>>(new Set());

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
      <Badge variant={variants[status as keyof typeof variants] || 'outline'} className="text-xs">
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const toggleCard = (dealId: number) => {
    setOpenCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <Card key={patient.deal_id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{patient.patient_full_name || 'Без имени'}</span>
              </CardTitle>
              {getStatusBadge(patient.patient_status)}
            </div>
            <div className="text-sm text-muted-foreground">
              {patient.clinic_name || 'Клиника не указана'}
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Arrival Section */}
            {visibleFieldGroups.includes('arrival') && (
              <Collapsible
                open={openCards.has(patient.deal_id)}
                onOpenChange={() => toggleCard(patient.deal_id)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">Прибытие</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openCards.has(patient.deal_id) ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Дата:</span>
                      <div>{formatDate(patient.arrival_datetime)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Транспорт:</span>
                      <div>{patient.arrival_transport_type || '-'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Рейс:</span>
                      <div>{patient.arrival_flight_number || '-'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Квартира:</span>
                      <div>{patient.apartment_number || '-'}</div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Departure Section */}
            {visibleFieldGroups.includes('departure') && (
              <div className="p-2 rounded bg-orange-50 dark:bg-orange-950/20 space-y-2">
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-orange-600 rotate-45" />
                  <span className="font-medium text-sm">Отъезд</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Дата:</span>
                    <div>{formatDate(patient.departure_datetime)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Город:</span>
                    <div>{patient.departure_city || '-'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Visa Section */}
            {visibleFieldGroups.includes('visa') && (
              <div className="p-2 rounded bg-green-50 dark:bg-green-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Виза</span>
                  </div>
                  {patient.visa_status && (
                    <Badge 
                      variant={patient.visa_status === 'Active' ? 'default' : 'destructive'} 
                      className="text-xs"
                    >
                      {patient.visa_status === 'Active' ? 'Активна' : 
                       patient.visa_status === 'Expiring Soon' ? 'Истекает' : 'Истекла'}
                    </Badge>
                  )}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Тип:</span> {patient.visa_type || '-'}
                </div>
                {patient.days_until_visa_expires !== null && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">До истечения:</span>{' '}
                    {patient.days_until_visa_expires > 0 
                      ? `${patient.days_until_visa_expires} дней` 
                      : patient.days_until_visa_expires === 0 
                        ? 'Истекает сегодня' 
                        : `Просрочено на ${Math.abs(patient.days_until_visa_expires)} дней`}
                  </div>
                )}
              </div>
            )}

            {/* Personal Section (Super Admin only) */}
            {visibleFieldGroups.includes('personal') && userRole === 'super_admin' && (
              <div className="p-2 rounded bg-purple-50 dark:bg-purple-950/20 space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-sm">Личные данные</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Телефон:</span> {patient.patient_phone || '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span> {patient.patient_email || '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Паспорт:</span> {patient.patient_passport || '-'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
