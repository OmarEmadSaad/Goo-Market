import Container from "@/components/ui/Container";
import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <Container className="py-8">
      <span className="sr-only" role="status">
        Searching
      </span>
      <Skeleton className="mb-4 h-8 w-64" />
      <Skeleton className="mb-8 h-10 w-full max-w-xl" />
      <ProductGridSkeleton count={8} />
    </Container>
  );
}
