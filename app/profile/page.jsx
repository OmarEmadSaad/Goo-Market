"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import {
  fetchUser,
  updateUser,
  deleteUser,
  setUserId,
  logout,
} from "../ReduxSystem/usersSlice";

const DEFAULT_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4Avj4TSMtuTPrA1IqGtlWogrd6D3aZhVwCA98c3NC442QLQU0rmqWv7M&s";

const Profile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userId, currentUser, status, error } = useSelector(
    (state) => state.users
  );
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: "",
    email: "",
    password: "",
    photo: null,
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId && storedUserId !== userId) {
      dispatch(setUserId(storedUserId));
    } else if (!storedUserId && !userId) {
      Swal.fire({
        icon: "error",
        title: "No user logged in",
        text: "Please log in to view your profile.",
      });
      router.push("/login");
    }
  }, [userId, dispatch, router]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUser(userId));
    } else {
      setEditedUser({
        name: "",
        email: "",
        password: "",
        photo: null,
      });
      setPreviewURL(DEFAULT_IMAGE);
    }
  }, [userId, dispatch]);

  useEffect(() => {
    if (currentUser) {
      const userPhoto = currentUser.image || DEFAULT_IMAGE;
      setEditedUser({
        name: currentUser.userName || "",
        email: currentUser.Email || "",
        password: currentUser.password || "",
        photo: userPhoto,
      });
      setPreviewURL(userPhoto);
    }
  }, [currentUser]);

  useEffect(() => {
    if (error && status === "failed") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
      });
      setEditedUser({
        name: "",
        email: "",
        password: "",
        photo: null,
      });
      setPreviewURL(DEFAULT_IMAGE);
    }
  }, [error, status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewURL(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewURL(editedUser.photo || DEFAULT_IMAGE);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return editedUser.photo || DEFAULT_IMAGE;

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_UPLOAD_PRESET);

    try {
      setUploading(true);
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      setUploading(false);
      return data.secure_url;
    } catch (error) {
      setUploading(false);
      Swal.fire({
        icon: "error",
        title: "Image Upload Failed",
        text: error.message,
      });
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      const imageUrl = await uploadImage();

      const updatedFields = {};
      if (editedUser.name && editedUser.name !== currentUser?.userName) {
        updatedFields.userName = editedUser.name;
      }
      if (editedUser.email && editedUser.email !== currentUser?.Email) {
        updatedFields.Email = editedUser.email;
      }
      if (
        editedUser.password &&
        editedUser.password !== currentUser?.password
      ) {
        updatedFields.password = editedUser.password;
      }
      if (imageUrl !== (currentUser?.image || DEFAULT_IMAGE)) {
        updatedFields.image = imageUrl;
      }

      if (Object.keys(updatedFields).length === 0) {
        Swal.fire({
          icon: "info",
          title: "No changes made",
          showConfirmButton: false,
          timer: 1500,
        });
        setEditing(false);
        return;
      }

      const mergedData = {
        ...currentUser,
        ...updatedFields,
      };

      await dispatch(updateUser({ id: userId, userData: mergedData })).unwrap();

      Swal.fire({
        icon: "success",
        title: "Profile updated successfully!",
        showConfirmButton: false,
        timer: 1500,
      });
      setEditing(false);
      setImageFile(null);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        dispatch(logout());
        Swal.fire({
          icon: "success",
          title: "Account deleted successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 dark:bg-[#03001C] dark:text-white">
      <div className="w-96 bg-white shadow-lg rounded-xl dark:bg-[#0B2447] dark:text-white">
        <div className="flex flex-col items-center bg-green-500 text-white p-6 rounded-t-xl dark:bg-[#0B2447] ">
          {editing ? (
            <div className="flex items-center gap-3">
              {previewURL || editedUser.photo ? (
                <img
                  src={previewURL || editedUser.photo}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : null}
              <div className="relative h-[50px] w-[130px]">
                <input
                  type="file"
                  name="photo"
                  id="customFile"
                  accept=".jpg,.png,.jpeg"
                  className="hidden "
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="customFile"
                  className=" absolute top-0 left-0 w-full h-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-blue-gray-900 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200"
                >
                  Upload Photo
                </label>
              </div>
            </div>
          ) : (
            editedUser.photo && (
              <img
                src={editedUser.photo}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
            )
          )}
          <h2 className="text-2xl font-semibold mt-3 ">My Profile</h2>
        </div>
        <div className="p-6 space-y-3">
          <div>
            <label className="dark:text-white block text-sm font-medium text-gray-700">
              Name
            </label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={editedUser.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none text-sm text-gray-700 dark:text-black"
              />
            ) : (
              <p className="text-gray-700 text-sm ">
                {editedUser.name || "N/A"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              Email
            </label>
            {editing ? (
              <input
                type="email"
                name="email"
                value={editedUser.email}
                onChange={handleChange}
                className="dark:text-black w-full p-2 border rounded-md focus:outline-none text-sm text-gray-700"
              />
            ) : (
              <p className="text-gray-700 text-sm ">
                {editedUser.email || "N/A"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">
              Password
            </label>
            {editing ? (
              <input
                type="password"
                name="password"
                value={editedUser.password}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none text-sm text-gray-700 dark:text-black"
              />
            ) : (
              <p className="text-gray-700 text-sm ">
                {editedUser.password ? "********" : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-center p-4 border-t space-x-4">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={uploading || status === "loading"}
                className={`px-4 py-2 bg-blue-500 text-white rounded-md text-sm ${
                  uploading || status === "loading"
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-600"
                }`}
              >
                {uploading || status === "loading"
                  ? "Saving..."
                  : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setImageFile(null);
                  setPreviewURL(editedUser.photo || DEFAULT_IMAGE);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-yellow-500 text-gray-800 rounded-md text-sm"
              >
                Edit Profile
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
              >
                Delete Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
