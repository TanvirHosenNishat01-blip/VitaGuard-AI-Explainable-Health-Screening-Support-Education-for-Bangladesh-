export function getDashboardPath(role) {
  if (!role) {
    try {
      role = JSON.parse(localStorage.getItem('user') || 'null')?.role || localStorage.getItem('userRole');
    } catch {
      role = localStorage.getItem('userRole');
    }
  }
  role = String(role || '').toLowerCase();
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'doctor') return '/doctor/dashboard';
  if (role === 'patient') return '/dashboard';
  return '/login';
}
