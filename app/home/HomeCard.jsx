import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";

const HomeCard = ({ product }) => {
  return (
    <div>
      <Card className="w-72">
        <CardHeader shadow={false} floated={false} className="h-48">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </CardHeader>
        <CardBody>
          <Typography variant="h5" color="blue-gray" className="mb-2">
            {product.name}
          </Typography>
          <Typography color="gray" className="mb-4 font-normal">
            Brand: Essence
          </Typography>
          <div className="flex items-center gap-2 mb-2">
            <Typography color="gray" className="line-through">
              EGP {product.price}
            </Typography>
            <Typography color="green">
              EGP {product.price - product.price * 0.1} (10% Off)
            </Typography>
          </div>
        </CardBody>
        <CardFooter className="pt-0">
          <button className="w-full bg-green-500 text-white py-2 rounded">
            Add To Cart
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HomeCard;

// "use client";
// import React from "react";
// import {
//   Card,
//   CardHeader,
//   CardBody,
//   CardFooter,
//   Typography,
//   Button,
// } from "@material-tailwind/react";
// import { useDispatch, useSelector } from "react-redux";
// import { updateCart } from "../ReduxSystem/cartSlice";

// const HomeCard = ({ product }) => {
//   const dispatch = useDispatch();
//   const { cartItems } = useSelector((state) => state.cart);
//   const userId = typeof window !== "undefined" ? localStorage.getItem("userID") : null;

//   const handleAddToCart = () => {
//     if (!userId) {
//       window.location.href = "/login";
//       return;
//     }

//     const existingItem = cartItems.find((item) => item.id === product.id);
//     let updatedCart;

//     if (existingItem) {
//       updatedCart = cartItems.map((item) =>
//         item.id === product.id
//           ? { ...item, quantity: item.quantity + 1 }
//           : item
//       );
//     } else {
//       updatedCart = [
//         ...cartItems,
//         { id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 },
//       ];
//     }

//     dispatch(updateCart({ userId, cart: updatedCart }));
//   };

//   return (
//     <Card className="w-80">
//       <CardHeader shadow={false} floated={false} className="h-48">
//         <img
//           src={product.image}
//           alt={product.name}
//           className="h-full w-full object-cover"
//         />
//       </CardHeader>
//       <CardBody>
//         <Typography variant="h5" color="blue-gray" className="mb-2">
//           {product.name}
//         </Typography>
//         <Typography color="gray" className="mb-4 font-normal">
//           Brand: Essence
//         </Typography>
//         <div className="flex items-center gap-2 mb-2">
//           <Typography color="gray" className="line-through">
//             EGP {product.price}
//           </Typography>
//           <Typography color="green">
//             EGP {product.price - product.price * 0.1} (10% Off)
//           </Typography>
//         </div>
//       </CardBody>
//       <CardFooter className="pt-0">
//         <Button
//           className="w-full bg-green-500 text-white py-2 rounded"
//           onClick={handleAddToCart}
//         >
//           إضافة إلى العربة
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// };

// export default HomeCard;
