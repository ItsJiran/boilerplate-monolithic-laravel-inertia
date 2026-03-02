# Frontend Architecture Documentation

## Tech Stack
- **Framework**: React 18 + Inertia.js
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (auth store)
- **Real-time**: Laravel Echo + Reverb (WebSocket)
- **HTTP Client**: Axios

---

## Directory Structure

```
resources/js/
├── app.jsx                 # Inertia app entry point
├── bootstrap.js            # Axios + Echo configuration
├── Components/             # Reusable UI components
│   ├── *.jsx              # Base components (Button, Modal, Input, etc.)
│   └── ui/                # Design system components
│       ├── atoms/         # Atomic components (Card, Button, Heading, etc.)
│       └── molecules/     # Composite components (Header, Sidebar, Table, etc.)
├── Hooks/                 # Custom React hooks
│   └── useChunkUpload.js  # Chunked file upload hook
├── Layouts/               # Page layouts
│   ├── AuthenticatedLayout.jsx
│   ├── GuestLayout.jsx
│   ├── DashboardLayout.jsx
│   └── AuthLayout.jsx
├── Pages/                 # Inertia pages (route-mapped)
│   ├── Admin/            # Admin module pages
│   ├── Auth/             # Authentication pages
│   ├── Test/             # Test pages (Database, Socket, etc.)
│   └── *.jsx             # Top-level pages
├── lib/                   # Utilities and helpers
│   ├── enums.js          # Frontend enums (CustomerType, IdentityType, etc.)
│   ├── utils.js          # Utility functions (date, phone formatting)
│   ├── routes.js         # Route helpers
│   └── authRoles.js      # Role checking utilities
└── stores/                # Zustand state stores
    └── useAuthStore.jsx   # Authentication state
```

---

## Core Patterns

### 1. Inertia.js Page Components
All pages follow this pattern:
```jsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function PageName({ auth, data }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2>Page Title</h2>}
        >
            <Head title="Page Title" />
            {/* Page content */}
        </AuthenticatedLayout>
    );
}
```

### 2. Form Handling with Inertia
Using `useForm` hook for form state management:
```jsx
const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: ''
});

const submit = (e) => {
    e.preventDefault();
    post(route('resource.store'));
};
```

### 3. State Management
- **Global Auth State**: Zustand store (`useAuthStore`)
- **Form State**: Inertia's `useForm` hook
- **Local State**: React's `useState` for component-specific state

### 4. Real-time Updates (WebSocket)
```jsx
useEffect(() => {
    const channel = window.Echo.private(`channel-name.${id}`);
    
    channel.listen('.event.name', (e) => {
        // Handle event
    });
    
    return () => window.Echo.leave(`channel-name.${id}`);
}, [id]);
```

---

## Component Architecture

### Base Components (`/Components`)
Reusable form and UI primitives:
- `PrimaryButton`, `SecondaryButton`, `DangerButton`
- `TextInput`, `Checkbox`, `InputLabel`, `InputError`
- `Modal`, `Dropdown`
- `ApplicationLogo`, `NavLink`, `ResponsiveNavLink`

### Design System (`/Components/ui`)

#### Atoms (Single-purpose components)
- `Button` - Customizable button with variants
- `Card`, `CardHeader`, `CardBody`, `CardFooter`
- `Heading`, `Paragraph`
- `InputGroup`, `SelectField`, `ComboBox`
- `Breadcrumbs`
- `StatCard` - Dashboard statistics card
- `PreviewCard`, `SidebarCard`, `SidebarListItem`
- `IndexHeader`, `IndexTableCard`
- `AreaChart` - Chart visualization

#### Molecules (Composite components)
- `Header` - Page header with breadcrumbs
- `Sidebar` - Navigation sidebar
- `TableWithPagination` - Data table with pagination controls
- `ChartVisualization` - Chart wrapper with filters
- `DashboardPreview` - Dashboard summary cards
- `FiltersPeriod` - Date range filters

---

## Layouts

### 1. AuthenticatedLayout
Main application layout with:
- Top navigation bar
- User dropdown menu
- Responsive sidebar
- Notification bell

### 2. GuestLayout
Simple layout for public pages:
- Centered content
- Application logo
- Minimal styling

### 3. DashboardLayout
Dashboard-specific layout:
- Sidebar with stats
- Chart visualizations
- Period filters

### 4. AuthLayout
Authentication pages layout:
- Centered form
- Branding
- Clean design

---

## Custom Hooks

### useChunkUpload
Handles large file uploads by splitting into chunks:
```javascript
const { uploadFile, isUploading, progress } = useChunkUpload(
    url,
    onProgress,
    onSuccess,
    onError
);

await uploadFile(file, { session_id: sessionId });
```

**Features:**
- 1MB chunk size
- Sequential upload
- Progress tracking
- Error handling

---

## Utilities (`/lib`)

### enums.js
Frontend enums matching backend:
```javascript
export const UserRole = {
    ADMIN: 'admin',
    USER: 'user',
    config: {
        admin: { label: 'Admin', value: 'admin', color: 'purple' },
        user: { label: 'User', value: 'user', color: 'blue' }
    }
};
```

### utils.js
Helper functions:
- **Date utilities**: `getFormattedDate`, `getMonthRange`, `getWeekRange`, `getYearRange`
- **Phone utilities**: `sanitizePhoneDigits`, `normalizePhoneNumber`, `formatPhoneNumber`
- **Constants**: `months` array (Indonesian labels)

**Phone Formatting Example:**
```javascript
formatPhoneNumber('081234567890')  // → "+62 812-3456-7890"
normalizePhoneNumber('081234567890') // → "+62812345678"
```

---

## Page Modules

(Your application specific modules go here)

---

## State Management

### useAuthStore (Zustand)
```javascript
const useAuthStore = create((set) => ({
    user: null,
    roles: [],
    
    hydrate: (auth) => set({
        user: auth?.user,
        roles: auth?.roles || []
    }),
    
    logout: () => set({ user: null, roles: [] })
}));
```

**Usage:**
```javascript
const { user } = useAuthStore();
```

---

## WebSocket Integration

### Configuration (`bootstrap.js`)
```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
```

### Channel Authorization
Private channels require authentication via `routes/channels.php`:
```php
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
```

---

## Routing

### Inertia Route Helper
```javascript
import { router } from '@inertiajs/react';

// Navigate
router.visit(route('users.show', userId));

// Reload current page
router.reload({ only: ['users'] });

// Post data
router.post(route('users.store'), data);
```

### Named Routes
Routes are defined in `routes/web.php` with names:
```php
Route::get('dashboard', [DashboardController::class, 'index'])
    ->name('dashboard');
```

Frontend usage:
```javascript
route('dashboard')  // → "/dashboard"
```

---

## Styling Conventions

### Tailwind CSS
All components use Tailwind utility classes:
```jsx
<div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Title</h3>
</div>
```

### Common Patterns
- **Cards**: `bg-white shadow-sm sm:rounded-lg p-6`
- **Buttons**: `px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700`
- **Tables**: `min-w-full divide-y divide-gray-200`
- **Forms**: `space-y-6` for vertical spacing

---

## Best Practices

### 1. Component Organization
- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into hooks

### 2. State Management
- Use `useForm` for form state
- Use Zustand for global state (auth, settings)
- Use `useState` for local component state
- Avoid prop drilling - use context or stores

### 3. Performance
- Use `router.reload({ only: [...] })` to reload specific props
- Lazy load heavy components
- Memoize expensive computations with `useMemo`
- Use `useCallback` for event handlers passed to children

### 4. Error Handling
- Display validation errors from `errors` object
- Show user-friendly error messages
- Handle network errors gracefully
- Use try-catch for async operations

### 5. Accessibility
- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers

---

## Development Workflow

### 1. Create New Page
```bash
# 1. Create page component
touch resources/js/Pages/Features/NewPage.jsx

# 2. Add route in routes/web.php
Route::get('new-page', [Controller::class, 'index'])
    ->name('features.new-page');

# 3. Create controller method
public function index() {
    return Inertia::render('Features/NewPage', [
        'data' => $data
    ]);
}
```

### 2. Add New Component
```bash
# Atomic component
touch resources/js/Components/ui/atoms/NewComponent.jsx

# Molecule component
touch resources/js/Components/ui/molecules/NewComposite.jsx
```

### 3. Create Custom Hook
```bash
touch resources/js/Hooks/useCustomHook.js
```

---

## Environment Variables

Required frontend env vars in `.env`:
```env
VITE_APP_NAME="Matrix App"
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

---

## Build & Deployment

### Development
```bash
npm run dev  # Start Vite dev server with HMR
```

### Production
```bash
npm run build  # Build optimized assets
```

### Assets
Built assets are placed in `public/build/` and referenced via Vite manifest.

---

## Testing Considerations

### Component Testing
- Use React Testing Library
- Test user interactions, not implementation
- Mock Inertia router and form hooks

### E2E Testing
- Use Playwright or Cypress
- Test critical user flows
- Test WebSocket connections

---

## Common Patterns in Codebase

### 2. Form Submission
```jsx
const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: ''
});

const submit = (e) => {
    e.preventDefault();
    post(route('resource.store'), {
        onSuccess: () => {
            // Handle success
        },
        onError: () => {
            // Handle error
        }
    });
};
```

### 3. Modal Pattern
```jsx
const [showModal, setShowModal] = useState(false);

<Modal show={showModal} onClose={() => setShowModal(false)}>
    <div className="p-6">
        {/* Modal content */}
    </div>
</Modal>
```

---


---

## Real-Time Entity Highlighting & Broadcasting

The application utilizes a powerful combination of **Laravel Websockets (Reverb/Pusher)**, **Inertia.js**, and **Zustand** to deliver real-time reactive UI updates across connected clients.

### 1. Broadcasting & Websockets (`channels.php` & `useAppBroadcast.js`)
- The backend pushes `.created` or `.updated` events to specific channels (e.g., `user.{id}`).
- The React frontend actively listens via the `useBroadcast` hook. When an event fires, it automatically interprets the payload and triggers a targeted `router.reload({ only: [...] })` through Inertia.js. This fetches the freshest partial data without refreshing the browser window.

### 2. Generic Zustand Highlight Store (`useHighlightStore.js`)
- To provide visual feedback that an item was just updated by another user or process, the ID of the mutated record is injected into a generic local Zustand dictionary store: `highlightedItems: { 'some_entity': [id] }`.
- The store intelligently sets a strict `setTimeout` (e.g., 5 seconds) the moment an ID is registered, automatically wiping it from the registry to prevent memory leaks and permanent highlighting.

### 3. UI Rendering (`Index.jsx` Tables)
- Dashboard tables and lists continuously subscribe to this generic `useHighlightStore`. 
- During the `map` iteration of array records, if the current row's ID matches a staged ID in the Zustand store, Tailwind CSS pulsing and color-highlight classes (like `bg-yellow-100 animate-pulse transition-colors duration-1000`) are dynamically injected.
- When the 5-second timeout ultimately clears the Zustand ID, the UI gracefully fades back to its default state.
