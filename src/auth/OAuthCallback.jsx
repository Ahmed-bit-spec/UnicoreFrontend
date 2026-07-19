import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/client";

const OAuthCallback = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const completeGoogleLogin = async () => {
      // If the backend redirected here with an error query param, show it and abort
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      if (error) {
        console.error("OAuth callback error (redirect):", error);
        // Use toast if available to show message then go to login
        try {
          // lazy import to avoid adding a top-level dependency in this file
          const { toast } = await import("sonner");
          toast.error(decodeURIComponent(error));
        } catch (e) {
          console.error(e);
        }
        navigate("/login", { replace: true });
        return;
      }
      try {
        // Fetch user data with credentials (cookie) already set by backend
        const { data } = await api.get("auth/me", { withCredentials: true });
        const userObj = data.data || data.user;
        login(userObj);

        // Navigate based on role
        const destination = userObj.role === "admin" ? "/admin/dashboard" : "/dashboard";
        navigate(destination, { replace: true });
      } catch (error) {
        console.error("OAuth callback error:", error);
        navigate("/login", { replace: true });
      }
    };

    completeGoogleLogin();
  }, [navigate, login, t]);

  return <div>{t.common.completingLogin}</div>;
};

export default OAuthCallback;
