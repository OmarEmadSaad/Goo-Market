import { Suspense } from "react";
import SearchPageContent from "./SearchPageContent";
export const metadata = {
  title: "Search page",
  description: "search for products",
};

const Search = () => {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  );
};

export default Search;
