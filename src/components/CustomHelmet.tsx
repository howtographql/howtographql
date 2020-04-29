import * as React from "react";
import { Helmet } from "react-helmet";

interface Props {
  title: string;
  description: string;
  location?: any;
  overrideDescription?: string;
}

export default function CustomHelmet({
  title,
  description,
  location,
  overrideDescription,
}: Props) {
  const image = "https://www.howtographql.com/social.png";
  const link = [] as any;
  if (location) {
    const canonicalUrl = `https://www.howtographql.com${location.pathname}`;
    link.push({ rel: "canonical", href: canonicalUrl, key: canonicalUrl });
  }

  return (
    <Helmet
      title={title}
      meta={[
        { name: "description", content: overrideDescription || title },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ]}
      link={link}
    />
  );
}
