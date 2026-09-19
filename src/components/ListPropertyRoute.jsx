import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RegisterPage from "../pages/RegisterPage";
import { Spinner } from "./ui/Primitives";

// Used for the public "List your property" nav link. A logged-out visitor
// sees the owner registration form as before. But if someone is already
// logged in, showing the registration form again is confusing (and was the
// reported bug) - so we route them somewhere useful instead.
export default function ListPropertyRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (user) {
    const destination = user.role === "owner" || user.role === "admin" ? "/owner/dashboard" : "/profile";
    return <Navigate to={destination} replace />;
  }

  return <RegisterPage forcedRole="owner" />;
}
