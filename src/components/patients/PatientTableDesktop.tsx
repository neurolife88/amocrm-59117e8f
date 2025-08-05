
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Edit2, Check, X, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCities } from '@/hooks/useCities';

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
  const { cities } = useCities();
  const [editingField, setEditingField] = useState<{ dealId: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // Return tickets modal state
  const [showReturnTicketsModal, setShowReturnTicketsModal] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [returnTicketsData, setReturnTicketsData] = useState({
    departure_transport_type: '',
    departure_city: '',
    departure_datetime: null as Date | null,
    departure_flight_number: ''
  });

  const startEditing = (dealId: number, field: string, currentValue: string) => {
    setEditingField({ dealId, field });
    setEditValue(currentValue || '');
  };

  const saveEdit = async (dealId: number, field: string) => {
    try {
      console.log('Saving edit:', { dealId, field, editValue });
      
      const updates: Partial<PatientData> = {};
      
      // Map field names to PatientData properties
      const fieldMapping: Record<string, keyof PatientData> = {
        'apartment_number': 'apartment_number',
        'departure_city': 'departure_city',
        'departure_datetime': 'departure_datetime',
        'departure_flight_number': 'departure_flight_number'
      };
      
      const propertyName = fieldMapping[field];
      if (propertyName) {
        (updates as any)[propertyName] = editValue;
        console.log('Mapped field:', { field, propertyName, value: editValue });
      } else {
        console.error('Unknown field:', field);
        throw new Error(`Неизвестное поле: ${field}`);
      }

      console.log('Calling onPatientUpdate with:', { dealId, updates });
      await onPatientUpdate(dealId, updates);
      
      setEditingField(null);
      toast({
        title: "Успешно обновлено",
        description: "Данные пациента обновлены",
      });
    } catch (error) {
      console.error('Error in saveEdit:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось обновить данные",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleAddReturnTickets = (dealId: number) => {
    setSelectedDealId(dealId);
    setShowReturnTicketsModal(true);
  };

  const handleSaveReturnTickets = () => {
    console.log('Saving return tickets data:', {
      dealId: selectedDealId,
      ...returnTicketsData
    });
    setShowReturnTicketsModal(false);
    setReturnTicketsData({
      departure_transport_type: '',
      departure_city: '',
      departure_datetime: null,
      departure_flight_number: ''
    });
    setSelectedDealId(null);
  };

  const handleCancelReturnTickets = () => {
    setShowReturnTicketsModal(false);
    setReturnTicketsData({
      departure_transport_type: '',
      departure_city: '',
      departure_datetime: null,
      departure_flight_number: ''
    });
    setSelectedDealId(null);
  };

  const isEditing = (dealId: number, field: string) => {
    return editingField?.dealId === dealId && editingField?.field === field;
  };

  const canEdit = (field: string) => {
    const editableFields = [
      'apartment_number',
      'departure_city', 
      'departure_datetime',
      'departure_flight_number'
    ];
    
    return (userRole === 'coordinator' || userRole === 'super_admin') && editableFields.includes(field);
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveEdit(patient.deal_id, field);
                } else if (e.key === 'Escape') {
                  cancelEdit();
                }
              }}
              className="h-8 text-sm"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => saveEdit(patient.deal_id, field)}
              className="h-6 w-6 p-0"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelEdit}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      );
    }

    return (
      <TableCell
        className={canEdit(field) ? 'cursor-pointer hover:bg-muted/50 group' : ''}
        onClick={() => canEdit(field) && startEditing(patient.deal_id, field, rawValue)}
        title={canEdit(field) ? 'Клик для редактирования' : ''}
      >
        <div className="flex items-center gap-2">
          <span>{displayValue}</span>
          {canEdit(field) && (
            <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
    
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      'Билеты куплены': { variant: 'default', label: 'Билеты куплены' },
      'на лечении': { variant: 'secondary', label: 'На лечении' },
      'квартира заказана': { variant: 'outline', label: 'Квартира заказана' },
      'обратные билеты с лечения': { variant: 'destructive', label: 'Обратные билеты' }
    };

    const config = statusConfig[status] || { variant: 'outline' as const, label: status };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getVisaBadge = (visaStatus: string | null, daysUntilExpires: number | null) => {
    if (visaStatus === null) return '-';
    
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      'Active': { variant: 'default', label: 'Активна' },
      'Expiring Soon': { variant: 'secondary', label: 'Истекает скоро' },
      'Expired': { variant: 'destructive', label: 'Истекла' }
    };

    const config = statusConfig[visaStatus] || { variant: 'outline' as const, label: visaStatus };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label} {daysUntilExpires !== null ? `(${daysUntilExpires} дн.)` : ''}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Пациент всегда отображается */}
            <TableHead>Пациент</TableHead>
            
            {/* Basic fields */}
            {visibleFieldGroups.includes('basic') && (
              <>
                <TableHead>Страна</TableHead>
                <TableHead>Клиника</TableHead>
                <TableHead>Статус сделки</TableHead>
                <TableHead>Дата и время прибытия</TableHead>
                <TableHead>Транспорт</TableHead>
                <TableHead>Рейс</TableHead>
                <TableHead>Квартира</TableHead>
                <TableHead>Тип визы</TableHead>
                <TableHead>Количество дней в визе</TableHead>
                <TableHead>Истекает</TableHead>
                <TableHead>Паспорт номер</TableHead>
                <TableHead>Город</TableHead>
              </>
            )}
            
            {/* Arrival fields */}
            {visibleFieldGroups.includes('arrival') && (
              <>
                <TableHead>Страна</TableHead>
                <TableHead>Клиника</TableHead>
                <TableHead>Статус сделки</TableHead>
                <TableHead>Дата и время прибытия</TableHead>
                <TableHead>Транспорт</TableHead>
                <TableHead>Рейс</TableHead>
                <TableHead>Терминал</TableHead>
                <TableHead>Количество пассажиров</TableHead>
                <TableHead>Квартира</TableHead>
              </>
            )}
            
            {/* Departure fields */}
            {visibleFieldGroups.includes('departure') && (
              <>
                <TableHead>Страна</TableHead>
                <TableHead>Клиника</TableHead>
                <TableHead>Статус сделки</TableHead>
                <TableHead>Дата и время прибытия</TableHead>
                <TableHead>Дата и время убытия</TableHead>
                <TableHead>Город убытия</TableHead>
                <TableHead>Номер рейса</TableHead>
              </>
            )}
             
            {/* Treatment fields */}
            {visibleFieldGroups.includes('treatment') && (
              <>
                <TableHead>Страна</TableHead>
                <TableHead>Номер квартиры</TableHead>
                <TableHead>Клиника</TableHead>
                <TableHead>Статус сделки</TableHead>
                <TableHead>Дата прибытия</TableHead>
                <TableHead>Дата убытия</TableHead>
                <TableHead>Виза истекает</TableHead>
                <TableHead>Действия</TableHead>
              </>
            )}
             
            {/* Visa fields */}
            {visibleFieldGroups.includes('visa') && (
              <>
                <TableHead>Страна</TableHead>
                <TableHead>Клиника</TableHead>
                <TableHead>Статус сделки</TableHead>
                <TableHead>Тип визы</TableHead>
                <TableHead>Количество дней в визе</TableHead>
                <TableHead>Истекает</TableHead>
              </>
            )}
            
            {/* Personal fields (super admin only) */}
            {visibleFieldGroups.includes('personal') && userRole === 'super_admin' && (
              <>
                <TableHead>Клиника</TableHead>
                <TableHead>Страна</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Дата рождения</TableHead>
                <TableHead>Номер паспорта</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Электронный адрес</TableHead>
                <TableHead>Должность</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => {

            return (
            <TableRow key={`${patient.deal_id}-${patient.patient_full_name}`} className="group">
              {/* Пациент всегда отображается */}
              <TableCell className="font-medium">
                {patient.patient_full_name || '-'}
              </TableCell>
              
              {/* Basic fields */}
              {visibleFieldGroups.includes('basic') && (
                <>
                  <TableCell>{patient.deal_country || '-'}</TableCell>
                  <TableCell>{patient.clinic_name || '-'}</TableCell>
                  <TableCell>{patient.status_name || '-'}</TableCell>
                  <TableCell>{formatDate(patient.arrival_datetime)}</TableCell>
                  <TableCell>{patient.arrival_transport_type || '-'}</TableCell>
                  <TableCell>{patient.arrival_flight_number || '-'}</TableCell>
                  <TableCell>{patient.apartment_number || '-'}</TableCell>
                  <TableCell>{patient.visa_type || '-'}</TableCell>
                  <TableCell>{patient.visa_days || '-'}</TableCell>
                  <TableCell>
                    {getVisaBadge(patient.visa_status, patient.days_until_visa_expires)}
                  </TableCell>
                  {renderEditableCell(patient, 'patient_passport', patient.patient_passport)}
                  <TableCell>{patient.patient_city || '-'}</TableCell>
                </>
              )}
              
              {/* Arrival fields */}
              {visibleFieldGroups.includes('arrival') && (
                <>
                  <TableCell>{patient.deal_country || '-'}</TableCell>
                  <TableCell>{patient.clinic_name || '-'}</TableCell>
                  <TableCell>{patient.status_name || '-'}</TableCell>
                  <TableCell>{formatDate(patient.arrival_datetime)}</TableCell>
                  <TableCell>{patient.arrival_transport_type || '-'}</TableCell>
                  <TableCell>{patient.arrival_flight_number || '-'}</TableCell>
                  <TableCell>{patient.arrival_terminal || '-'}</TableCell>
                  <TableCell>{patient.passengers_count || '-'}</TableCell>
                  {renderEditableCell(patient, 'apartment_number', patient.apartment_number)}
                </>
              )}
              
              {/* Departure fields */}
              {visibleFieldGroups.includes('departure') && (
                <>
                  <TableCell>{patient.deal_country || '-'}</TableCell>
                  <TableCell>{patient.clinic_name || '-'}</TableCell>
                  <TableCell>{patient.status_name || '-'}</TableCell>
                  <TableCell>{formatDate(patient.arrival_datetime)}</TableCell>
                  {renderEditableCell(patient, 'departure_datetime', patient.departure_datetime)}
                  {renderEditableCell(patient, 'departure_city', patient.departure_city)}
                  {renderEditableCell(patient, 'departure_flight_number', patient.departure_flight_number)}
                </>
              )}
                
              {/* Treatment fields */}
              {visibleFieldGroups.includes('treatment') && (
                <>
                  <TableCell>{patient.deal_country || '-'}</TableCell>
                  {renderEditableCell(patient, 'apartment_number', patient.apartment_number)}
                  <TableCell>{patient.clinic_name || '-'}</TableCell>
                  <TableCell>{patient.status_name || '-'}</TableCell>
                  <TableCell>{patient.arrival_datetime ? format(parseISO(patient.arrival_datetime), 'dd.MM.yyyy', { locale: ru }) : '-'}</TableCell>
                  <TableCell>{formatDate(patient.departure_datetime)}</TableCell>
                  <TableCell>
                    {getVisaBadge(patient.visa_status, patient.days_until_visa_expires)}
                  </TableCell>
                  <TableCell>
                    {patient.status_name === 'на лечении' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddReturnTickets(patient.deal_id)}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Добавить билеты
                      </Button>
                    )}
                  </TableCell>
                </>
              )}
               
              {/* Visa fields */}
              {visibleFieldGroups.includes('visa') && (
                <>
                  <TableCell>{patient.deal_country || '-'}</TableCell>
                  <TableCell>{patient.clinic_name || '-'}</TableCell>
                  <TableCell>{patient.status_name || '-'}</TableCell>
                  <TableCell>{patient.visa_type || '-'}</TableCell>
                  <TableCell>{patient.visa_days || '-'}</TableCell>
                  <TableCell>
                    {getVisaBadge(patient.visa_status, patient.days_until_visa_expires)}
                  </TableCell>
                </>
              )}
              
              {/* Personal fields (super admin only) */}
              {visibleFieldGroups.includes('personal') && userRole === 'super_admin' && (
                <>
                  <TableCell>{patient.clinic_name || '-'}</TableCell>
                  <TableCell>{patient.patient_country || '-'}</TableCell>
                  <TableCell>{patient.patient_city || '-'}</TableCell>
                  <TableCell>{patient.patient_birthday ? format(parseISO(patient.patient_birthday), 'dd.MM.yyyy', { locale: ru }) : '-'}</TableCell>
                  <TableCell>{patient.patient_passport || '-'}</TableCell>
                  <TableCell>{patient.patient_phone || '-'}</TableCell>
                  <TableCell>{patient.patient_email || '-'}</TableCell>
                  <TableCell>{patient.patient_position || '-'}</TableCell>
                </>
              )}
            </TableRow>
          );
          })}
        </TableBody>
      </Table>

      {/* Return Tickets Modal */}
      <Dialog open={showReturnTicketsModal} onOpenChange={setShowReturnTicketsModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Добавить обратные билеты</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Transport Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departure_transport_type" className="text-right">
                Транспорт
              </Label>
              <Select
                value={returnTicketsData.departure_transport_type}
                onValueChange={(value) => setReturnTicketsData(prev => ({ ...prev, departure_transport_type: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите транспорт" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Самолет">Самолет</SelectItem>
                  <SelectItem value="Поезд">Поезд</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departure_city" className="text-right">
                Город
              </Label>
              <Select
                value={returnTicketsData.departure_city}
                onValueChange={(value) => setReturnTicketsData(prev => ({ ...prev, departure_city: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.city_name}>
                      {city.city_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Дата</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="col-span-3 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnTicketsData.departure_datetime ? (
                      format(returnTicketsData.departure_datetime, 'PPP', { locale: ru })
                    ) : (
                      <span className="text-muted-foreground">Выберите дату</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnTicketsData.departure_datetime}
                    onSelect={(date) => setReturnTicketsData(prev => ({ ...prev, departure_datetime: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Flight Number */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departure_flight_number" className="text-right">
                Рейс
              </Label>
              <Input
                id="departure_flight_number"
                value={returnTicketsData.departure_flight_number}
                onChange={(e) => setReturnTicketsData(prev => ({ ...prev, departure_flight_number: e.target.value }))}
                className="col-span-3"
                placeholder="Номер рейса"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelReturnTickets}>
              Отмена
            </Button>
            <Button onClick={handleSaveReturnTickets}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
