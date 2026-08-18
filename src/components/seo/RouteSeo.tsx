import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE = "https://lightembassychurch.org";

type Meta = { title: string; description: string };

const ROUTE_META: Record<string, Meta> = {
  "/": {
    title: "Light Embassy Church — Worship, Learn, Pray Together",
    description:
      "A worldwide Christian community for worship, Bible study, prayer, podcasts and sermons. Join Light Embassy and grow in faith together.",
  },
  "/watch": {
    title: "Watch Services & Sermons — Light Embassy",
    description:
      "Stream the latest Light Embassy Church services, sermons and teaching videos on demand, and revisit messages you have already watched.",
  },
  "/prayers": {
    title: "Prayer Wall — Light Embassy",
    description:
      "Share a prayer request or pray for others on the Light Embassy prayer wall. Post anonymously and join a global community lifting each other up.",
  },
  "/podcast": {
    title: "Podcast Episodes — Light Embassy",
    description:
      "Listen to Light Embassy Church podcast episodes anywhere. Stream or download teaching, testimony and encouragement for your daily walk with God.",
  },
  "/learn": {
    title: "Learn & Bible Study — Light Embassy",
    description:
      "Grow through Bible study tools, guided reading, quizzes and discipleship resources designed to help you understand Scripture and apply it daily.",
  },
  "/locations": {
    title: "Find Locations — Light Embassy",
    description:
      "Find a Light Embassy Church location near you, view service times and get directions to gather with believers in your city.",
  },
  "/radio": {
    title: "Live Christian Radio — Light Embassy",
    description:
      "Tune in to live Christian radio stations from around the world, grouped by region, and find worship and teaching broadcasts close to you.",
  },
  "/messages": {
    title: "Messages — Light Embassy",
    description:
      "Send a private message to the Light Embassy team for prayer, pastoral support or questions about the church and its ministries.",
  },
  "/progress": {
    title: "Your Progress & Badges — Light Embassy",
    description:
      "Track your streaks, milestones and badges as you watch, listen, pray and study with the Light Embassy community each week.",
  },
  "/chat": {
    title: "Light Guide Assistant — Light Embassy",
    description:
      "Ask the Light Guide assistant about services, Bible questions, prayer and everything happening across the Light Embassy Church community.",
  },
  "/privacy": {
    title: "Privacy Policy — Light Embassy",
    description:
      "Read how Light Embassy Church collects, uses, stores and protects your personal data, and how you can access or erase your information.",
  },
  "/delete-account": {
    title: "Delete Your Account — Light Embassy",
    description:
      "Request permanent deletion of your Light Embassy account and all associated data, including prayers, messages and activity history.",
  },
  "/release-notes": {
    title: "Release Notes — Light Embassy",
    description:
      "See what is new in the Light Embassy app, including new features, improvements and fixes shipped in each release of the mobile and web app.",
  },
  "/auth": {
    title: "Sign In or Create Account — Light Embassy",
    description:
      "Sign in or create a free Light Embassy account to save verses, track progress, join the community forum and get personalised content.",
  },
};

const FALLBACK: Meta = ROUTE_META["/"];

export const RouteSeo = () => {
  const { pathname } = useLocation();
  const key = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "/";
  const meta = ROUTE_META[key] ?? FALLBACK;
  const url = `${SITE}${key === "/" ? "/" : key}`;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      {!ROUTE_META[key] && key !== "/" && <meta name="robots" content="noindex" />}
    </Helmet>
  );
};

export default RouteSeo;
