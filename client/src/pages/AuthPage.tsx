import { useParams } from "react-router-dom";
import { Auth } from "../components/auth/auth";


const AuthPage = () => {
  const { pathname } = useParams<{ pathname: string }>();
  const normalizedPath =
    pathname === "signin"
      ? "sign-in"
      : pathname === "signup"
        ? "sign-up"
        : pathname || "sign-in";

  return (
    <div className="p-6 min-h-screen flex items-center justify-center h-[80vh]">
      <Auth path={normalizedPath} className='bg-black/10 ring ring-indigo-900' />
    </div>
  );
}

export default AuthPage;