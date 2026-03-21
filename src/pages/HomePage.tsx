import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { loadUser } from '@/store/authSlice';

export default function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadUser())
      .unwrap()
      .then(() => {
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        navigate('/login', { replace: true });
      });
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-bg text-primary flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
    </div>
  );
}
