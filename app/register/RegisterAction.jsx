import uploadImageToCloudinary from "../components/uploadCloudinary";

const USERS_API = process.env.NEXT_PUBLIC_USERS_URL;

// UUID Generator
const generateUUID = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const addNewUsers = async (prev, { formData, users }) => {
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

  let usersData = users?.users;
  if (!usersData) {
    try {
      const res = await fetch(USERS_API);
      if (!res.ok) throw new Error("Failed to fetch users data.");
      usersData = await res.json();
    } catch (error) {
      console.error("User fetch error:", error);
      return {
        errors: {},
        success: false,
        message: "Failed to check email availability. Please try again later.",
      };
    }
  }

  const emailExists = usersData.find(
    (u) =>
      u.email?.toLowerCase() === email.toLowerCase() ||
      u.Email?.toLowerCase() === email.toLowerCase()
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
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      imageUrl = "";
    }
  }

  const newUser = {
    userName: name,
    Email: email,
    password,
    gender,
    image: imageUrl,
    role: "user",
    cart: "",
  };

  try {
    const response = await fetch(USERS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      throw new Error(`Invalid server response: ${responseText}`);
    }

    if (!response.ok) {
      throw new Error(
        responseData.message || "Failed to register. Please try again."
      );
    }

    const userId = responseData.id || generateUUID();

    return {
      errors: {},
      success: true,
      message: "User registered successfully!",
      userId,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      errors: {},
      success: false,
      message: error.message || "Registration failed. Try again.",
    };
  }
};
