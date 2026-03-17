import { withHomeLayout } from "widgets/layouts/home";

const ProfilePage = () => {
  return (
    <div className="wrapper">
      <span>Profile</span>
    </div>
  );
};

export default withHomeLayout(ProfilePage);
