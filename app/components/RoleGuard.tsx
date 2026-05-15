'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/app/context/BusinessContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RoleGuard({ children, allowedRoles = ['owner', 'manager'] }: RoleGuardProps) {
  const { selectedBusiness } = useBusiness();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (selectedBusiness) {
      const role = selectedBusiness.role?.toLowerCase() || 'staff';
      if (!allowedRoles.includes(role)) {
        alert('Akses Ditolak: Anda tidak memiliki izin (Hanya Manager/Owner).');
        router.replace('/dashboard');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [selectedBusiness, allowedRoles, router]);

  if (!isAuthorized) return null;
  
  return <>{children}</>;
}