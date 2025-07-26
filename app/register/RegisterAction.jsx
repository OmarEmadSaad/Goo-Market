const USERS_API = process.env.NEXT_PUBLIC_USERS_URL;

const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_UPLOAD_PRESET);
  formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUD_NAME);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await res.json();
  return data.secure_url;
};

export const addNewUsers = async (prev, { formData }) => {
  const name = formData.get("name")?.trim();
  const email = formData.get("email")?.trim();
  const password = formData.get("password")?.trim();
  const gender = formData.get("gender");
  const photo = formData.get("photo");

  const errors = {};

  if (!name || !/^[a-zA-Z0-9\s]{3,15}$/.test(name)) {
    errors.name =
      "Name must be 3-15 characters long and contain only letters, numbers, or spaces.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
    errors.password =
      "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, and a number.";
  }

  if (!gender || !["Male", "Female"].includes(gender)) {
    errors.gender = "Please select a valid gender (Male or Female).";
  }

  if (photo && !["image/jpeg", "image/png"].includes(photo.type)) {
    errors.photo = "Only JPG and PNG images are allowed.";
  }

  let existingUsers = {};
  try {
    const res = await fetch(USERS_API);
    if (res.ok) existingUsers = await res.json();
  } catch (err) {
    console.error("Fetching users failed:", err);
  }

  const emailExists = Object.values(existingUsers || {}).some(
    (u) =>
      u.Email?.toLowerCase() === email.toLowerCase() ||
      u.email?.toLowerCase() === email.toLowerCase()
  );
  if (emailExists) {
    errors.email = "This email is already registered.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      success: false,
      message: Object.values(errors).join(" "),
    };
  }

  let imageUrl = "";
  if (photo) {
    try {
      imageUrl = await uploadImageToCloudinary(photo);
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  }

  const userIndex = Object.keys(existingUsers).length;
  const newUser = {
    userName: name,
    Email: email,
    password,
    gender,
    image: imageUrl,
    role: "user",
    cart: "",
    id: Math.random().toString(36).substr(2, 4),
  };

  try {
    const updatedUsers = {
      ...existingUsers,
      [userIndex]: newUser,
    };

    const response = await fetch(USERS_API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUsers),
    });

    if (!response.ok) {
      throw new Error("Failed to save user data.");
    }

    return {
      errors: {},
      success: true,
      message: "User registered successfully!",
      userId: newUser.id,
    };
  } catch (err) {
    console.error("Saving user failed:", err);
    return {
      errors: {},
      success: false,
      message: err.message || "Failed to save user.",
    };
  }
};
