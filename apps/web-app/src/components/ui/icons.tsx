/**
 * Shared SVG Icon Components
 * Extracted from auth/login for DRY compliance
 * Reusable across the application
 */

interface IconProps {
    color?: string;
    size?: number;
}

// Person Icon - for individual account type
export const PersonIcon = ({ color = "#6B7280", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// Building Icon - for juristic entity
export const BuildingIcon = ({ color = "#6B7280", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="2" />
        <path d="M9 8H15M9 12H15M9 16H12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// Group Icon - for community enterprise
export const GroupIcon = ({ color = "#6B7280", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3" stroke={color} strokeWidth="2" />
        <circle cx="15" cy="8" r="3" stroke={color} strokeWidth="2" />
        <path d="M3 20C3 17.2386 5.68629 15 9 15C10.2 15 11.3 15.3 12.2 15.8M15 15C18.3137 15 21 17.2386 21 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// Lock Icon - for password field
export const LockIcon = ({ color = "#1B5E20", size = 20 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="2" />
        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke={color} strokeWidth="2" />
    </svg>
);

// Eye Icon - for password visibility toggle
export const EyeIcon = ({ open, color = "#6B7280" }: { open: boolean; color?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        {open ? (
            <>
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
            </>
        ) : (
            <>
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12" />
                <path d="M2 12C2 12 5 19 12 19C19 19 22 12 22 12" />
                <path d="M4 4L20 20" />
            </>
        )}
    </svg>
);
