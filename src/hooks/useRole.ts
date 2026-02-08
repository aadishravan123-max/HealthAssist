import { useAuth, UserRole } from '@/context/AuthContext';

export function useRole() {
    const { role, loading } = useAuth();

    const isPatient = role === 'patient';
    const isDoctor = role === 'doctor';
    const isAdmin = role === 'admin';

    const checkRole = (requiredRole: UserRole) => role === requiredRole;

    return {
        role,
        loading,
        isPatient,
        isDoctor,
        isAdmin,
        checkRole
    };
}
