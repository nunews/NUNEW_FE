import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import MyPageTabMenu from "@/components/mypage/MyPageTabMenu";
import MyProfile from "@/components/mypage/MyProfile";

const Mypage = () => {
  return (
    <div className="min-h-screen">
      <Header logo={true} />
      <main className="mb-18 pt-18">
        <div className="flex flex-col px-6">
          <MyProfile />
        </div>
        <MyPageTabMenu />
      </main>
      <Footer />
    </div>
  );
};

export default Mypage;
