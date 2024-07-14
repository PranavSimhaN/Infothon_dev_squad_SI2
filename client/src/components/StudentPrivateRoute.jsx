import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function StudentPrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  return currentUser && (currentUser.role=="user") ? <Outlet /> : <Navigate to='/sign-in' />;
}