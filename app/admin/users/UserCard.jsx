"use client";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/loding/page";

const UserCard = () => {
  const [lastUser, setLastUser] = useState("");
  const [numOfUsers, setNumOfUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const urlUsers = process.env.NEXT_PUBLIC_USERS_URL;

    if (!urlUsers) {
      setError("Users URL is not defined");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${urlUsers}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const usersData = await res.json();

        const lastUserName =
          usersData[usersData.length - 1]?.name ||
          usersData[usersData.length - 1]?.userName ||
          "No user";
        const numOfUsers = usersData.length || 0;
        setLastUser(lastUserName);
        setNumOfUsers(numOfUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Typography color="red">Error UserCard: {error}</Typography>;
  }

  return (
    <div>
      <Card
        variant="gradient"
        className="w-full max-w-[20rem] p-8 bg-green-600 text-white dark:bg-[#0B2447] dark:text-white"
      >
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="m-0 mb-8 rounded-none border-b border-white/10 pb-7 text-center"
        >
          <Typography
            variant="h1"
            color="white"
            className="mt-6 flex justify-center gap-1 text-7xl font-normal"
          >
            <span className="mt-2 text-4xl">Users</span>
          </Typography>
        </CardHeader>
        <CardBody className="p-0">
          <div className="flex flex-col gap-5">
            <h1>
              Number of Users:{" "}
              <span className="text-blue-900 dark:text-white">
                {numOfUsers}
              </span>
            </h1>
            <h1>
              Last Added User:{" "}
              <span className="text-blue-900 dark:text-white">
                {lastUser ? lastUser : "None"}
              </span>
            </h1>
          </div>
        </CardBody>
        <CardFooter className="mt-12 p-0">
          <Button
            size="lg"
            color="white"
            className="hover:scale-[1.02] focus:scale-[1.02] active:scale-100"
            ripple={false}
            fullWidth={true}
            onClick={() => router.push("/admin/users")}
          >
            Check Users
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserCard;
