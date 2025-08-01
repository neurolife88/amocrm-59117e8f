# User Interface Specifications by Role

## Coordinator Interface

### Login Page
**URL**: `/login`  
**Purpose**: Coordinator authentication with automatic clinic assignment

**UI Components**:
- System logo "Встреча гостей"
- Email input field (required)
- Password input field (required, hidden text)
- "Login" button (primary CTA)
- "Forgot password?" link
- Loading indicator during form submission
- Validation error messages

**Actions**:
- Send credentials to Supabase Auth for verification
- Fetch user data from `user_profiles` table by auth.uid()
- Determine role and clinic assignment (`clinic_name`)
- Set session and redirect to `/dashboard`
- Show error message for invalid credentials

### Main Patient Table
**URL**: `/dashboard`  
**Purpose**: Centralized patient management for coordinator's clinic

**Header Components**:
- System logo
- Clinic name (static, from user_profiles.clinic_name)
- User name and "Coordinator" role
- Logout button with LogOut icon

**Filter Panel**:
- Patient name search field (real-time, with Search icon)
- Quick filter buttons: "Today", "Tomorrow", "Week", "All"
- Status filter: "Arriving", "In Treatment", "Departing", "All"
- "Reset Filters" button

**Field Group Toggles**:
- "Show Arrival" (Plane icon)
- "Show Departure" (rotated Plane icon)
- "Show Visa" (FileText icon)
- "Show In Treatment" (Hospital icon)

**Desktop Table (768px+)**:
- **Basic columns**: Patient name, Status, Arrival date, Transport, Flight, Apartment number
- **Additional columns** (when groups enabled):
  - *Arrival*: Arrival city, Airport/station, Terminal, Passenger count
  - *Departure*: Departure city, Departure date, Departure flight number
  - *Visa*: Visa expiry, Visa status, Days until expiry
  - *Treatment*: Medical status, Assigned coordinator, Departure planning status
- **Inline editing** for: apartment_number, departure_city, departure_datetime, departure_flight_number
- **Color-coded rows** by visa status (green/orange/red)
- **Edit button** in each row

**Mobile Cards (<768px)**:
- Compact cards with basic information
- Collapsible blocks: "Arrival", "Departure", "Visa", "Treatment"
- Edit button in each card

**Status Indicators**:
- Real-time connection status (Wifi/WifiOff icons)
- Patient status badges: "Arriving" (blue), "In Treatment" (green), "Departing" (orange)
- Visa alerts: "Active" (green), "Expiring" (orange), "Expired" (red)

### Patient Edit Modal
**Purpose**: Edit all 4 key patient fields in single interface with validation

**Modal Header**:
- "Editing: [Patient Name]"
- Clinic name subtitle
- Close button (X)

**Accommodation Block (blue background)**:
- MapPin icon
- "Apartment Number" field (text input, placeholder: "e.g. 205A")

**Departure Planning Block (orange background)**:
- Plane icon
- "Departure City" field (text input with autocomplete from cities_directory)
- "Departure Date/Time" field (datetime-local input)
- "Departure Flight Number" field (text input, placeholder: "e.g. CA912")
- Hint: "Visa expires: [date]" under date field

**Real-time Validation**:
- Date/time format checking
- Max date restriction = visa_expiry_date
- Error indicators under each field

**Modal Footer**:
- "Cancel" button (gray, close without saving)
- "Save Changes" button (blue, primary CTA)

## Director Interface

### Main Patient Table (Extended Version)
**URL**: `/dashboard`  
**Purpose**: Monitor and analyze all patients across all 4 clinics

**Extended Header**:
- System logo
- Clinic selector: "All Clinics", "Beijing Medical Center", "Shanghai Hospital", "Guangzhou Hub", "Shenzhen Hospital"
- User name and "Director" role
- Logout button

**Extended Filter Panel**:
- Patient name search (works across all clinics)
- Date filters: "Today", "Tomorrow", "Week", "Month", "All"
- Status filter: "Arriving", "In Treatment", "Departing", "All"
- **Additional clinic filter** (dropdown with multiple selection)
- "Urgent Visas" filter (expiring within 15 days)

**Extended Field Group Toggles**:
- "Show Arrival"
- "Show Departure"
- "Show Visa"
- "Show In Treatment"
- "Show Statistics" (clinic summary information)

**Read-Only Patient Table**:
- Same columns as coordinator
- **NO inline editing capability**
- **NO edit buttons**
- Additional "Clinic" column (always visible)
- Grouping by clinics (collapsible sections)

**Statistics Dashboard**:
- Summary cards for each clinic: patient count, arriving, in treatment
- Clinic load chart
- Urgent cases list (expiring visas)

## Super Administrator Interface

### Main Patient Table (Full Version)
**URL**: `/dashboard`  
**Purpose**: Complete system data management including personal info and audit

**Maximum Header**:
- System logo
- Clinic selector + "Show All" option
- "View Mode" / "Edit Mode" toggle
- User name and "Super Administrator" role
- Additional menu: "Settings", "Users", "Audit"

**Complete Filter Panel**:
- All director filters +
- Last activity filter
- Extended search (by email, passport, phone)

**All Field Group Toggles**:
- "Show Arrival"
- "Show Departure"
- "Show Visa"
- "Show In Treatment"
- **"Show Personal Data"** (phone, email, passport, country)
- **"Show Deal Data"** (status, pipeline, AMO CRM ID)
- **"Show System Data"** (creation dates, updates, sync)

**Full Patient Table**:
- All fields from master_view
- Edit capability for ALL fields (not just 4 basic ones)
- Additional columns: amocrm_contact_id, created_at, updated_at, sync_status
- Bulk operations: select multiple records for group actions
- Buttons: "Edit", "Delete", "Force Sync"

**Additional Panels**:
- **Audit Panel**: Recent system changes in real-time
- **Sync Panel**: AMO CRM integration status, errors, statistics
- **Users Panel**: Active sessions, recent logins

### Audit Page
**URL**: `/audit`  
**Purpose**: Monitor all system changes with detailed information

**Audit Filters**:
- Period: "Last Hour", "Today", "Week", "Month", "Custom"
- User: dropdown with all system users
- Table: "All", "meeting_guests", "patients_in_treatment"
- Operation type: "All", "INSERT", "UPDATE", "DELETE"
- Source: "Web Interface", "AMO CRM", "System"

**Audit Table**:
- Columns: Time, User, Action, Table, Field, Old Value, New Value
- Expandable change details
- Export logs to CSV

**Real-time Feed**:
- Live change feed in right sidebar
- Push notifications for critical operations

## Responsive Design Requirements

### Mobile-First Breakpoints
- **Mobile**: 375px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### Mobile Optimizations
- Touch-friendly buttons (minimum 44px height)
- Card-based layout for patient data
- Swipe gestures for navigation
- Collapsible sections to save space
- Bottom sheet modals for editing

### Desktop Optimizations
- Table-based layout for efficient data scanning
- Inline editing with hover states
- Keyboard shortcuts for common actions
- Multi-column layouts utilizing screen space
- Modal dialogs for complex operations

## Common Technical Requirements

### Real-time Updates
- Supabase subscriptions for live data changes
- WebSocket connections with status indicators
- Automatic reconnection on failures
- Visual indication of new/changed records

### Security & Access Control
- Row Level Security (RLS) in Supabase by role and clinic
- UI and API level permission validation
- Automatic logout on inactivity
- Complete operation logging in audit_log

### Performance & UX
- Skeleton loading states for all database queries
- Error boundaries with graceful error handling
- Offline mode with sync on reconnection
- Optimistic UI updates with rollback capability

## User Experience Flows

### Coordinator Daily Workflow
1. **Login** → Automatic redirect to dashboard showing only their clinic
2. **Morning Review** → Check "Today" filter for arriving patients
3. **Advance Preparation** → Assign apartment numbers for tomorrow's arrivals
4. **Status Updates** → Update departure information for completing patients
5. **Urgent Cases** → Handle visa expiry alerts with departure planning

### Director Monitoring Workflow  
1. **Login** → Dashboard overview of all 4 clinics
2. **Clinic Selection** → Switch between clinics or view all
3. **Analysis** → Use statistics dashboard for load balancing
4. **Urgent Review** → Check "Urgent Visas" filter across all clinics
5. **Strategic Planning** → Export data for management reports

### Super Admin System Management
1. **System Overview** → Complete dashboard with all data fields
2. **Data Quality** → Check for missing or incorrect information
3. **User Management** → Monitor active sessions and user activities
4. **Audit Review** → Investigate changes and system operations
5. **Configuration** → Adjust system settings and permissions

## Accessibility Requirements

### Visual Accessibility
- High contrast color schemes
- Scalable font sizes (16px minimum)
- Clear visual hierarchy with proper heading structure
- Color-blind friendly status indicators
- Focus indicators for keyboard navigation

### Interaction Accessibility
- Keyboard navigation for all interactive elements
- Screen reader compatible markup
- Proper ARIA labels and descriptions
- Touch target minimum size of 44px
- Skip links for main content areas

### Content Accessibility
- Multi-language support (Chinese/English)
- Clear, simple language for instructions
- Consistent terminology throughout interface
- Progressive disclosure of complex information
- Error messages in user's preferred language