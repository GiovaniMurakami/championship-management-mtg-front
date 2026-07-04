import { decodeBlogHtmlForDisplay } from "../../utils/blogEditor";
import { blogMarkupToDisplayHtml } from "../../utils/blogMarkup";

export function BlogContent({ html }) {
  const decoded = decodeBlogHtmlForDisplay(html);
  const renderedHtml = blogMarkupToDisplayHtml(decoded);

  if (!renderedHtml) return null;

  return (
    <div
      className="blog-content text-[#d8cff0] leading-relaxed [&_.blog-card-image]:mx-auto [&_.blog-card-image]:block [&_.blog-card-image]:max-w-[220px] [&_a]:text-[#c795ff] [&_a]:underline [&_a]:underline-offset-2 [&_em]:italic [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#f5edff] [&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-xl [&_li]:mb-1 [&_p]:mb-4 [&_strong]:font-bold [&_strong]:text-[#f5edff] [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
