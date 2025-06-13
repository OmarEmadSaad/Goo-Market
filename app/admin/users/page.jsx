"use client";

import { Card, Typography, Button } from "@material-tailwind/react";
import Swal from "sweetalert2";
import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Loading from "@/app/loding/page";

const TABLE_HEAD = [
  "Avatar",
  "Username",
  "Gender",
  "Role",
  "Email",
  "Cart Items",
  "Actions",
];

const UsersTable = () => {
  const urlUser = process.env.NEXT_PUBLIC_USERS_URL;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUserId = Cookies.get("auth-token");
      const response = await axios.get(urlUser);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.users || [];

      if (data.length === 0) {
        setError("No users found in API response.");
        setUsers([]);
        return;
      }

      const filteredUsers = data.filter((user) => {
        return String(user.id) !== String(currentUserId) && user.id !== 1;
      });

      const validatedUsers = filteredUsers.map((user) => ({
        id: user.id || null,
        name: user.name || user.userName || user.username || "N/A",
        gender: user.gender || "N/A",
        email: user.email || user.Email || user.emailAddress || "N/A",
        role: user.role || "user",
        image:
          user.image ||
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Avj4TSMtuTPrA1IqGtlWogrd6D3aZhVwCA98c3NC442QLQU0rmqWv7M&s",
        cartItems: Array.isArray(user.cart) ? user.cart.length : 0,
      }));

      setUsers(validatedUsers);
      if (validatedUsers.length === 0) {
        setError("No users found after filtering.");
      }
    } catch (error) {
      console.error("Error fetching users:", error.message);
      setError("Failed to fetch users. Please check the server and try again.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const makeAdmin = async (id) => {
    if (!id) {
      Swal.fire("Error", "Invalid user ID", "error");
      return;
    }
    try {
      await axios.patch(`${urlUser}/${id}`, { role: "admin" });
      await getUsers();
      Swal.fire("Updated", "User has been promoted to Admin", "success");
    } catch (error) {
      console.error("Error promoting user:", error.message);
      Swal.fire("Error", "Failed to update user", "error");
    }
  };

  const demoteToUser = async (id) => {
    if (!id) {
      Swal.fire("Error", "Invalid user ID", "error");
      return;
    }
    try {
      await axios.patch(`${urlUser}/${id}`, { role: "user" });
      await getUsers();
      Swal.fire("Updated", "User has been demoted to User", "success");
    } catch (error) {
      console.error("Error demoting user:", error.message);
      Swal.fire("Error", "Failed to update user", "error");
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mt-4 text-4xl text-center">
        <h1 className="text-green-700 dark:text-white">Users</h1>
      </div>

      {error && (
        <Typography color="red" className="text-center mt-4">
          {error}
        </Typography>
      )}

      <Card className="h-full w-full overflow-auto mt-4">
        <table className="w-full min-w-max table-auto text-left dark:bg-[#0B2447] dark:text-[#ECFAE5]">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className={`border-b dark:bg-[#0B2447] border-blue-gray-100 bg-blue-gray-50 p-4 ${
                    head === "Actions" ? "text-center" : ""
                  }`}
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70 dark:text-[#ECFAE5]"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  <Loading />
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map(
                (
                  { name, gender, email, role, id, image, cartItems },
                  index
                ) => {
                  const isLast = index === users.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-blue-gray-100";

                  return (
                    <tr key={id || `user-${index}`}>
                      <td className={classes}>
                        <img
                          src={image}
                          alt={`${name}'s avatar`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal dark:text-[#ECFAE5]"
                        >
                          {name.slice(0, 8)}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal dark:text-[#ECFAE5]"
                        >
                          {gender}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal dark:text-[#ECFAE5]"
                        >
                          {role}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal dark:text-[#ECFAE5]"
                        >
                          {email}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="ml-4 font-normal dark:text-[#ECFAE5]"
                        >
                          {cartItems}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <div className="flex items-center justify-center gap-4">
                          {role === "admin" ? (
                            <Button
                              size="sm"
                              color="red"
                              onClick={() => demoteToUser(id)}
                            >
                              Demote to User
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              color="yellow"
                              onClick={() => makeAdmin(id)}
                            >
                              Promote to Admin
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center dark:text-[#ECFAE5]">
                  No other users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default UsersTable;
