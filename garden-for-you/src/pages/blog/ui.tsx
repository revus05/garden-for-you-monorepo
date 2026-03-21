import { BlogStaticContent } from "widgets/blog/static";
import { BlogYouTubeVideos } from "widgets/blog/yt-videos";
import { withHomeLayout } from "widgets/layouts/home";

const BlogPage = async () => {
  return (
    <div className="wrapper flex flex-col gap-16">
      <BlogStaticContent />
      <BlogYouTubeVideos />
    </div>
  );
};

export default withHomeLayout(BlogPage);
