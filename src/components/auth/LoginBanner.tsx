const LoginBanner = () => {
  return (
    <div className="flex flex-col w-full mt-[94px] ">
      <h2 className="font-black text-[var(--color-black)] text-lg py-8 dark:text-[var(--color-primary-40)]">
        NUNEW
      </h2>
      <h1 className=" text-[var(--color-black)] leading-[140%] text-4xl font-bold dark:text-white">
        관심있는 뉴스만
        <br />
        내맘대로.
      </h1>
      <h3 className="text-[var(--color-gray-80)] text-sm pt-2.5 dark:text-[var(--color-gray-60)]">
        핵심만 빠르게 세 줄 요약
      </h3>
    </div>
  );
};

export default LoginBanner;
