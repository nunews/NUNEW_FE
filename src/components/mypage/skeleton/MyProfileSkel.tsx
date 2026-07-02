export const MyProfileSkel = () => (
  <div className="flex flex-col gap-4 items-center justify-center mx-auto pb-8 animate-pulse">
    <div
      className="w-[80px] h-[80px] rounded-full 
  bg-[var(--color-gray-40)] dark:bg-[var(--color-gray-70)]"
    />

    <div className="flex flex-col items-center gap-2">
      <div
        className="w-24 h-4 rounded 
    bg-[var(--color-gray-40)] dark:bg-[var(--color-gray-70)]"
      />
      <div
        className="w-40 h-3 rounded 
    bg-[var(--color-gray-40)] dark:bg-[var(--color-gray-70)]"
      />
    </div>

    <div
      className="w-28 h-10 rounded-full 
  bg-[var(--color-gray-40)] dark:bg-[var(--color-gray-70)]"
    />
  </div>
);
