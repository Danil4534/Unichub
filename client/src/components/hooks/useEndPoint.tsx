import { useLocation } from "react-router-dom";

export const useEndPoint = (): string | null => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return segments.length > 0 ? segments[segments.length - 1] : null;
};
