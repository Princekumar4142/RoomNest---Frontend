import { Helmet } from "react-helmet-async";

const SITE_NAME = "RoomNest";
const DEFAULT_DESCRIPTION =
  "Find verified rooms, PGs, hostels and flats for students, professionals and families — no brokers, no fake listings.";
const DEFAULT_IMAGE = "https://loremflickr.com/1200/630/home,interior";

export default function SEO({ title, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE, noIndex = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Verified Rooms, Not Just Listings`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
