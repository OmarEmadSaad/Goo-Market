import LoginForm from "./LoginAction";
import RegisterButton from "./RegisterButton";

export const metadata = {
  title: "Login Page",
  description: "Login to the GooMarket",
};

const Page = () => {
  return (
    <section className="px-5 lg:px-0 text-center min-h-screen flex items-center justify-center">
      <div className="w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10 bg-white dark:bg-[#0B2447] dark:text-[#93B1A6]">
        <h3 className="text-[22px] leading-9 font-bold mb-10">
          Hello <span className="text-green-700">Welcome👋 </span> Back 😊🎉
        </h3>

        <LoginForm />

        <p className="mt-4 dark:text-[#93B1A6]">
          Do not have an account ? <RegisterButton />
        </p>
      </div>
    </section>
  );
};

export default Page;
