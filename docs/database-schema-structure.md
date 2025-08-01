# Database Schema and Structure

## Overview

The database follows a normalized structure with the central entity being the **Deal** (deal_id), which connects all patient-related information including contact details, visa data, arrival tickets, and departure tickets.

## Core Tables

### 1. Contacts Table
**Purpose**: Personal information of patients
```sql
CREATE TABLE contacts (
    id BIGINT PRIMARY KEY,
    deal_id BIGINT, -- Link to specific deal
    last_name TEXT,
    first_name TEXT,
    work_phone TEXT,
    work_email TEXT,
    position TEXT,
    preferred_name TEXT,
    birthday DATE,
    timezone TEXT,
    country VARCHAR,
    city TEXT,
    passport_number TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    amocrm_contact_id BIGINT UNIQUE
);
```

### 2. Deals Table  
**Purpose**: Main business logic, central entity
```sql
CREATE TABLE deals (
    id BIGINT PRIMARY KEY,
    lead_id VARCHAR,
    deal_name VARCHAR,
    country VARCHAR,
    visa_city VARCHAR,
    clinic_name VARCHAR, -- Link to clinics directory
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    pipeline_name VARCHAR,
    status_name VARCHAR
);
```

### 3. Visas Table
**Purpose**: Visa information for stay duration control
```sql
CREATE TABLE visas (
    id BIGINT PRIMARY KEY,
    deal_id BIGINT,
    visa_type TEXT,
    visa_days INTEGER, -- Days allowed in China
    entries_count VARCHAR,
    corridor_start_date DATE,
    corridor_end_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 4. Tickets to China Table
**Purpose**: Patient arrival information (equivalent to "meeting guests")
```sql
CREATE TABLE tickets_to_china (
    id BIGINT PRIMARY KEY,
    deal_id BIGINT,
    transport_type VARCHAR CHECK (transport_type IN ('Самолет', 'Поезд', 'Авиа', 'ЖД')),
    airport_code TEXT,
    arrival_city TEXT,  
    arrival_datetime TIMESTAMP,
    flight_number TEXT,
    terminal TEXT,
    passengers_count TEXT,
    apartment_number TEXT, -- EDITABLE by coordinator
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 5. Tickets from Treatment Table
**Purpose**: Patient departure information
```sql
CREATE TABLE tickets_from_treatment (
    id BIGINT PRIMARY KEY,
    deal_id BIGINT,
    return_transport_type TEXT CHECK (return_transport_type IN ('Самолет', 'Поезд', 'Авиа', 'ЖД')),
    departure_city TEXT, -- EDITABLE by coordinator
    departure_datetime TIMESTAMP, -- EDITABLE by coordinator
    departure_flight_number TEXT, -- EDITABLE by coordinator
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Reference Tables

### 6. Clinics Directory
**Purpose**: Medical facilities catalog
```sql
CREATE TABLE clinics_directory (
    id BIGINT PRIMARY KEY,
    short_name VARCHAR UNIQUE,
    full_name VARCHAR,
    address_chinese TEXT,
    address_english TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### 7. Cities Directory  
**Purpose**: Cities catalog with transport information
```sql
CREATE TABLE cities_directory (
    id BIGINT PRIMARY KEY,
    city_name VARCHAR UNIQUE,
    airport_code VARCHAR,
    railway_station_name VARCHAR,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Master View for Web Interface

This view combines all tables to provide complete patient information:

```sql
CREATE VIEW super_admin_master_view AS
SELECT 
    -- DEAL DATA
    d.id as deal_id,
    d.lead_id,
    d.deal_name,
    d.pipeline_name,
    d.status_name,
    d.clinic_name,
    d.country as deal_country,
    d.visa_city,
    
    -- CLINIC DATA
    cl.full_name as clinic_full_name,
    cl.address_chinese as clinic_address_chinese,
    cl.address_english as clinic_address_english,
    
    -- PATIENT DATA
    c.last_name as patient_last_name,
    c.first_name as patient_first_name,
    CONCAT(c.first_name, ' ', c.last_name) as patient_full_name,
    c.preferred_name as patient_preferred_name,
    c.work_phone as patient_phone,
    c.work_email as patient_email,
    c.birthday as patient_birthday,
    c.country as patient_country,
    c.city as patient_city,
    c.passport_number as patient_passport,
    c.amocrm_contact_id,
    
    -- ARRIVAL DATA (tickets_to_china)
    tc.arrival_datetime,
    tc.transport_type as arrival_transport_type,
    tc.airport_code as departure_airport_code,
    tc.arrival_city,
    tc.flight_number as arrival_flight_number,
    tc.terminal as arrival_terminal,
    tc.passengers_count,
    tc.apartment_number, -- EDITABLE by coordinator
    
    -- DEPARTURE DATA (tickets_from_treatment)  
    tf.return_transport_type as departure_transport_type,
    tf.departure_city, -- EDITABLE by coordinator
    tf.departure_datetime, -- EDITABLE by coordinator
    tf.departure_flight_number, -- EDITABLE by coordinator
    
    -- VISA DATA
    v.visa_type,
    v.visa_days,
    v.entries_count as visa_entries_count,
    v.corridor_start_date as visa_corridor_start,
    v.corridor_end_date as visa_corridor_end,
    
    -- COMPUTED FIELDS
    (tc.arrival_datetime::date + INTERVAL '1 day' * v.visa_days) as visa_expiry_date,
    ((tc.arrival_datetime::date + INTERVAL '1 day' * v.visa_days) - CURRENT_DATE) as days_until_visa_expires,
    
    -- Patient status based on dates
    CASE 
        WHEN tc.arrival_datetime > NOW() THEN 'Arriving'
        WHEN tc.arrival_datetime <= NOW() AND (tf.departure_datetime IS NULL OR tf.departure_datetime > NOW()) THEN 'In Treatment'
        WHEN tf.departure_datetime <= NOW() THEN 'Departed'
        ELSE 'Unknown'
    END as patient_status,
    
    -- Visa status based on expiry
    CASE 
        WHEN (tc.arrival_datetime::date + INTERVAL '1 day' * v.visa_days) < CURRENT_DATE THEN 'Expired'
        WHEN (tc.arrival_datetime::date + INTERVAL '1 day' * v.visa_days) - CURRENT_DATE <= 3 THEN 'Expiring Soon'
        ELSE 'Active'
    END as visa_status

FROM deals d
LEFT JOIN contacts c ON c.deal_id = d.id
LEFT JOIN tickets_to_china tc ON tc.deal_id = d.id  
LEFT JOIN tickets_from_treatment tf ON tf.deal_id = d.id
LEFT JOIN visas v ON v.deal_id = d.id
LEFT JOIN clinics_directory cl ON cl.short_name = d.clinic_name;
```

## Field Groups for UI Display

### 1. Basic Information (Always Visible)
- `patient_full_name` - Patient full name
- `clinic_name` - Clinic
- `patient_status` - Patient status  
- `deal_created_at` - Creation date

### 2. Arrival Data (Show/Hide Button)
- `arrival_datetime` - Arrival date and time
- `arrival_transport_type` - Transport type
- `departure_airport_code` - Departure airport code
- `arrival_city` - Arrival city
- `arrival_flight_number` - Flight number
- `arrival_terminal` - Terminal
- `passengers_count` - Passenger count
- `apartment_number` - Apartment number (EDITABLE)

### 3. Departure Data (Show/Hide Button)  
- `departure_transport_type` - Transport type
- `departure_city` - Departure city (EDITABLE)
- `departure_datetime` - Departure date/time (EDITABLE)
- `departure_flight_number` - Flight number (EDITABLE)

### 4. Visa Data (Show/Hide Button)
- `visa_type` - Visa type
- `visa_days` - Visa days
- `visa_expiry_date` - Expiry date
- `days_until_visa_expires` - Days until expiry
- `visa_status` - Visa status
- `visa_corridor_start` - Corridor start
- `visa_corridor_end` - Corridor end

### 5. Personal Data (Show/Hide Button - Super Admin Only)
- `patient_first_name` - First name
- `patient_last_name` - Last name
- `patient_phone` - Phone
- `patient_email` - Email
- `patient_birthday` - Birthday
- `patient_country` - Country
- `patient_passport` - Passport

## Editable Fields by Role

### Coordinator Can Edit:
- `apartment_number` - Apartment number (from tickets_to_china)
- `departure_city` - Departure city (from tickets_from_treatment)
- `departure_datetime` - Departure date/time (from tickets_from_treatment)
- `departure_flight_number` - Departure flight number (from tickets_from_treatment)

All other fields are read-only (data from AMO CRM).

## Role-Based Data Access

### Super Administrator:
- Sees ALL fields from ALL clinics
- Can use all filter buttons

### Director:
- Sees all clinics but limited field set
- Field groups: Basic + Arrival + Departure + Visa

### Coordinator:  
- Sees only their clinic (WHERE `clinic_name` = their clinic)
- Field groups: Basic + Arrival + Departure
- Can edit departure fields and apartment number