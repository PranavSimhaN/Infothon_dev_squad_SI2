import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function FacultyPrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  return currentUser && (currentUser.role=="faculty") ? <Outlet /> : <Navigate to='/sign-in' />;
}