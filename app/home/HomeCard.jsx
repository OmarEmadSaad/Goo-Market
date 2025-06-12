import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import ShowDetailsButton from "./ShowDetailsButton";

export const metadata = {
  title: "Product card",
  description: "Product card of GooMarket",
};

const HomeCard = ({ product }) => {
  return (
    <div>
      <Card className="w-72 dark:bg-[#03001C]">
        <CardHeader shadow={false} floated={false} className="h-48">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </CardHeader>
        <CardBody>
          <Typography
            variant="h5"
            color="blue-gray"
            className="mb-2 dark:text-[#ECFAE5]"
          >
            {product.name}
          </Typography>
          <Typography
            color="gray"
            className="mb-4 font-normal dark:text-[#ECFAE5]"
          >
            Brand: Essence
          </Typography>
          <div className="flex items-center gap-2 mb-2">
            <Typography
              color="gray"
              className="line-through dark:text-[#ECFAE5]"
            >
              EGP {product.price}
            </Typography>
            <Typography color="green">
              EGP {product.price - product.price * 0.1} (10% Off)
            </Typography>
          </div>
        </CardBody>
        <CardFooter className="pt-0">
          <ShowDetailsButton productId={product.id} />
        </CardFooter>
      </Card>
    </div>
  );
};

export default HomeCard;
