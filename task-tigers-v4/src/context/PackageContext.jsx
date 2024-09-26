import React, { createContext, useEffect, useState, useContext } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";

const PackageContext = createContext();

export const PackageProvider = ({ children }) => {
  const { setHasMembership } = useAuth(); // Access `setHasMembership` from AuthContext
  const [loading, setLoading] = useState(false);

  // Function to fetch the user's package based on userId
  const fetchUserPackage = async (userId) => {
    try {
      const response = await fetch(
        `http://13.126.118.3:3000/v1.0/users/user-packages/${userId}`,
      );
      const data = await response.json();

      let hasMembershipStatus = false;

      if (Array.isArray(data) && data.length > 0) {
        hasMembershipStatus = new Date(data[0].expiryDate) > new Date();
      } else if (data && typeof data === "object" && data._id) {
        hasMembershipStatus = new Date(data.expiryDate) > new Date();
      }

      // Update the membership status in AuthContext
      setHasMembership(hasMembershipStatus);

      // Show toast message based on membership status
      if (hasMembershipStatus) {
        toast.success("You have an active membership!");
      } else {
        toast.info("You do not have an active membership.");
      }
    } catch (error) {
      console.error("Error fetching package:", error);
      setHasMembership(false);
      toast.error("Failed to fetch current package.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's package when the userId is present in sessionStorage
  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      setLoading(true);
      fetchUserPackage(userId);
    }
  }, []);

  return (
    <PackageContext.Provider value={{ loading, fetchUserPackage }}>
      {children}
    </PackageContext.Provider>
  );
};

export const usePackage = () => useContext(PackageContext);
