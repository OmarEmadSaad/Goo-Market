import ProductCard from "./product/ProductCard";
import UserCard from "./users/UserCard";

const Dashboard = () => {
  return (
    <div className="flex flex-col items-center p-4 lg:p-16 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-green-900 dark:text-white">
        Dashboard
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 w-full justify-evenly items-center">
        <ProductCard />
        <UserCard />
      </div>
    </div>
  );
};

export default Dashboard;
