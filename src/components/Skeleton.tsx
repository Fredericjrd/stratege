interface Props {
  className?: string;
}

export function Skeleton({ className = '' }: Props) {
  return (
    <div
      className={`animate-pulse bg-[#D4CFC6] rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function ExerciseSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Chargement de l'exercice">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-3/4" />
      <div className="flex flex-wrap gap-2 pt-2">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-9 w-20" />)}
      </div>
    </div>
  );
}
