import React, { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addAuth } from "../redux/slices/authSlice";
import handleScrollTop from "../utils/handleScrollTop";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdNotificationsActive,
} from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { PiUserCircleLight } from "react-icons/pi";
import {
  setHeaderMenu,
  setLoading,
  setNotificationBox,
  setProfileDetail,
} from "../redux/slices/conditionSlice";
import logo from "../assets/uem.png";


const Header = () => {
  const user = useSelector((store) => store.auth);
  const isHeaderMenu = useSelector((store) => store?.condition?.isHeaderMenu);
  const newMessageRecieved = useSelector((store) => store?.myChat?.newMessageRecieved);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      dispatch(setLoading(true));
      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          dispatch(addAuth(json.data));
          dispatch(setLoading(false));
        })
        .catch(() => dispatch(setLoading(false)));
    } else {
      navigate("/signin");
    }
    dispatch(setHeaderMenu(false));
  }, [token]);

  const { pathname } = useLocation();
  useEffect(() => {
    if (user) navigate("/");
    else if (pathname !== "/signin" && pathname !== "/signup") navigate("/signin");
    handleScrollTop();
  }, [pathname, user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  useEffect(() => {
    let prevScrollPos = window.pageYOffset;
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      document.getElementById("header").classList.toggle("hiddenbox", prevScrollPos < currentScrollPos && currentScrollPos > 80);
      prevScrollPos = currentScrollPos;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerMenuBox = useRef(null);
  const headerUserBox = useRef(null);

  const handleClickOutside = (event) => {
    if (
      headerMenuBox.current &&
      !headerUserBox?.current?.contains(event.target) &&
      !headerMenuBox.current.contains(event.target)
    ) {
      dispatch(setHeaderMenu(false));
    }
  };

  useEffect(() => {
    if (isHeaderMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isHeaderMenu]);

  return (
    <header
      id="header"
      className="w-full h-16 md:h-20 top-0 z-50 shadow-lg flex justify-between items-center px-6 transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <Link to="/">
          <img src={logo}  alt="SD-Chat" className="h-8 w-8" />
        </Link>
        <Link to="/">
          <span className="text-lg font-bold tracking-wider text-white">SD-Chat</span>
        </Link>
      </div>

      {user ? (
        <div className="flex items-center space-x-6">
          <div
            className={`relative cursor-pointer ${newMessageRecieved.length > 0 ? "animate-bounce" : ""}`}
            title={`Tem ${newMessageRecieved.length} novas notificações`}
            onClick={() => dispatch(setNotificationBox(true))}
          >
            <MdNotificationsActive fontSize={25} className="text-white hover:text-gray-300 transition-colors" />
            {newMessageRecieved.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {newMessageRecieved.length}
              </span>
            )}
          </div>

          <span className="text-white">Olá, {user.firstName}</span>

          <div
            ref={headerUserBox}
            onClick={() => dispatch(setHeaderMenu(!isHeaderMenu))}
            className="flex items-center space-x-2 border border-white/20 rounded-full p-2 hover:bg-white/10 cursor-pointer transition text-white"
          >
            <img src={user.image} alt="User" className="w-10 h-10 rounded-full border border-white/20" />
            {isHeaderMenu ? <MdKeyboardArrowUp fontSize={20} /> : <MdKeyboardArrowDown fontSize={20} />}
          </div>

          {isHeaderMenu && (
            <div
              ref={headerMenuBox}
              className="absolute top-16 right-4 w-48 bg-black/10 backdrop-blur-lg rounded-lg shadow-lg border border-white/20 overflow-hidden text-white" 
            >
              <div className="flex items-center p-3 hover:bg-white/10 cursor-pointer" onClick={() => dispatch(setProfileDetail())}>
                <PiUserCircleLight fontSize={23} />
                <span>Perfil</span>
              </div>
              <div className="flex items-center p-3 hover:bg-white/20 cursor-pointer" onClick={handleLogout}>
                <IoLogOutOutline fontSize={21} />
                <span>Sair</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Link to="/signin">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Entrar</button>
        </Link>
      )}
    </header>
  );
};

export default Header;