import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function ParentPrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  return currentUser && (currentUser.role=="parent") ? <Outlet /> : <Navigate to='/sign-in' />;
}