import { withHomeLayout } from "widgets/layouts/home";
import { ProfileInfo } from "widgets/profile/info";

const ProfilePage = () => {
  return (
    <div className="wrapper">
      <ProfileInfo />
    </div>
  );
};

export default withHomeLayout(ProfilePage);
