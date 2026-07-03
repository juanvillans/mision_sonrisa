import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";
import { authAPI } from "../services/api";
import misionSonrisaLogo from "../assets/misionSonrisaLogo.png";
import tooth from "../assets/tooth.jpg";
import secretariaLogo from "../assets/secretaria_logo.png";
import { Icon } from "@iconify/react";
import cintilloCorto from "../assets/cintilloCorto.png";

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    let emailInput = document.querySelector("#email");
    emailInput?.focus();
  }, 300);
});

export default function LoginPage() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Add state for showPassword
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();
  const { showError, showSuccess } = useFeedback();

  const [loadingReset, setLoadingReset] = useState(false);
  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard/Casos", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleForgotPsw = async (e) => {
    setLoadingReset(true);
    if (!email) {
      showError("Por favor ingrese su correo electrónico");
      return;
    }
    try {
      await authAPI.forgotPassword(email);
      showSuccess("Se ha enviado un enlace para restablecer la contraseña");
    } catch (err) {
      showError(err.message);
    } finally {
      setLoadingReset(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the authAPI.login method instead of fetch
      const res = await authAPI.login({ email, password });

      // Login successful
      if (res.status === "success") {
        console.log(res);

        login(res.data.user, res.data.token);
      }
    } catch (err) {
      showError(err.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication status
  if (authLoading) {
    return (
      <div className="md:min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <title>Iniciar Sesión - Misión Sonrisa</title>

      <div className="min-h-screen w-full relative md:flex bg-white bg-cover bg-center overflow-hidden">
        <img
          src={tooth}
          alt="lab"
          className=" h-screen w-full flex-1 object-bottom object-cover "
        />
        <div
          className="login-form  absolute w-[300px] md:min-w-[400px] md:w-[450px] left-10   pb-3 top-24 z-50 px-5 pt-4 md:pt-10 sm:pt-20  text-color1 md:p-16 rounded-3xl overflow-hidden"
          style={{}}
        >
         

          <form onSubmit={handleSubmit} className="fadeInUp  ">
            <div className="mb-4 mt-4  md:mt-10 ">
              <label className="block  text-sm  mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setemail(e.target.value)}
                className="w-full bg-gray-200 border-gray-200 border  text-gray-800 px-2 py-2 text-sm sm:px-3 sm:py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="relative mb-1 ">
              <label className="block  text-sm  mb-1" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-200 border-gray-200 border  text-gray-800 px-2 py-2 text-sm sm:px-3 sm:py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                required
              />
              {showPassword ? (
                <Icon
                  onClick={() => setShowPassword(!showPassword)}
                  icon="majesticons:eye-line"
                  className=" w-5 h-5  absolute right-3 top-8 font-bold text-gray-900 cursor-pointer"
                />
              ) : (
                <Icon
                  onClick={() => setShowPassword(!showPassword)}
                  icon="mdi:eye-off-outline"
                  className=" w-5 h-5  absolute right-3 top-8 font-bold text-gray-900 cursor-pointer"
                />
              )}
            </div>
            <div className="flex justify-end mb-6">
              {loadingReset ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
              ) : (
                <button
                  type="button"
                  onClick={handleForgotPsw}
                  className="text-sm hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group border-dark group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-rose-300 hover:before:[box-shadow:_20px_20px_20px_30px_#a21caf] duration-500 before:duration-500 hover:duration-500 underline underline-offset-2 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline hover:underline-offset-4  origin-left hover:decoration-2 hover:text-rose-300 relative  h-16 w-full border text-left p-3 text-dark text-base font-bold rounded-lg  overflow-hidden  before:absolute before:w-12 before:h-12 before:content[''] before:right-1 before:top-1 before:z-10 before:bg-violet-500 before:rounded-full before:blur-lg  after:absolute after:z-10 after:w-20 after:h-20 after:content['']  after:bg-rose-300 after:right-8 after:top-3 after:rounded-full after:blur-lg"
            >
              {loading ? "Ingresando..." : "INGRESAR"}
            </button>
          </form>
        </div>
      </div>
      <header className="flex justify-between gap-1 md:gap-4 flex-col md:flex-row items-center px-10 text-color1 text-sm z-40 w-full relative md:absolute  top-0 text-center -100 py-2 lg:py-5">
         <div className="  fadeInUp-delay-1 fadeInUp   backdrop-blur-none w-20 h-20 md:w-32 md:h-2w-32 flex items-center justify-center aspect-square rounded-full p-2.5 md:p-4">
            <img
              src={misionSonrisaLogo}
              className="logo inline-block mx-auto  "
              alt="logo del sistema"
            />
          </div>
          <div className="flex gap-2 items-center justify-center fadeInUp-delay-2 fadeInUp">
            <img
              src={secretariaLogo}
              alt="secretariaLogo"
              className="w-12 h-12  aspect-square  "
            />
            <img
              src={cintilloCorto}
              alt=""
              className="max-w-[240px] h-min rounded-xl "
            />
          </div>
      </header>
      <footer className="flex gap-1 flex-col md:flex-row items-center px-10 justify-between text-gray-50 text-sm z-40 w-full relative md:absolute bottom-0 text-center -100 py-1">
        <p className="text-xs">
          &copy; {new Date().getFullYear()} Casos. Todos los derechos
          reservados.
        </p>
        <a
          href="https://www.linkedin.com/in/juan-franemailsco-villasmil-tovar-50a3a1161/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opaemailty-100 text-xs opaemailty-65 cursor-pointer"
        >
          Desarrollado por Juan Villasmil
        </a>
      </footer>
    </>
  );
}
