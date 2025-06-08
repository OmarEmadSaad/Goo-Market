import RegisterButton from "./RegisterButton";

export const metadata = {
  title: "Login Page",
  description: "Login to the GooMarket",
};

const Page = () => {
  return (
    <section className="px-5 lg:px-0 text-center min-h-screen flex items-center justify-center">
      <div className="w-full max-w-[570px] mx-auto rounded-lg shadow-md md:p-10 bg-white">
        <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
          Hello <span className="text-blue-700">Welcome👋 </span> Back 😊🎉
        </h3>

        <form className="py-4 md:py-0">
          <div className="mb-5 text-left">
            <label className="block text-sm font-medium text-headingColor mb-1">
              Your Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="name@mail.com"
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none text-[16px] leading-7 focus:border-primaryColor text-headingColor placeholder:text-textColor rounded-md"
            />
          </div>

          <div className="mb-5 text-left">
            <label className="block text-sm font-medium text-headingColor mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="********"
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none text-[16px] leading-7 focus:border-primaryColor text-headingColor placeholder:text-textColor rounded-md"
            />
          </div>

          <div className="mt-7">
            <button
              className="w-full btn btn-accent text-white bg-green-600 py-2 rounded-md"
              type="submit"
            >
              Login
            </button>
          </div>

          <p className="mt-4">
            Do not have an account ? <RegisterButton />
          </p>
        </form>
      </div>
    </section>
  );
};

export default Page;
