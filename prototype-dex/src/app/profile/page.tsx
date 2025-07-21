import UserInfoCard from "@/app/components/profile/UserInfoCard";
import FavoritesTab from "@/app/components/profile/FavoritesTab";
import CaughtTab from "@/app/components/profile/CaughtTab";
import ExportImportSection from "@/app/components/profile/ExportImportSection";
import DeleteAccountSection from "@/app/components/profile/DeleteAccountSection";

export default function ProfilePage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center py-10 px-4">
      {/* Pokemon Background */}
      <div
        className="fixed inset-0 -z-10 bg-center bg-cover"
        style={{
          backgroundImage: "url('/detective-pikachu.jpg'), linear-gradient(135deg, #18181b 60%, #232326 100%)",
          opacity: 0.8,
        }}
      />
      
      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        {/* User Info Header */}
        <UserInfoCard />

        {/* Main Content Grid */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Export/Import */}
          <div className="w-full md:w-1/3">
            <ExportImportSection />
          </div>
          
          {/* Right: Favorites and Caught */}
          <div className="w-full md:w-2/3 flex flex-col gap-6">
            <FavoritesTab />
            <CaughtTab />
          </div>
        </div>

        {/* Bottom: Delete Account */}
        <DeleteAccountSection />
      </div>
    </div>
  );
}
