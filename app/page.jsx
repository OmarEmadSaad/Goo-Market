import { CarouselHome } from "./components/Carousel";
import Home from "./home/page";
export const metadata = {
  title: "GooMarket",
  description: "TV Laptop fan",
};

const App = () => {
  return (
    <div className="">
      <CarouselHome />
      <Home />
    </div>
  );
};

export default App;
