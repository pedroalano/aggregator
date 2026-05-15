import { XMLParser } from "fast-xml-parser";

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const res = await fetch(feedURL, { headers: { "User-Agent": "gator" } });
  const xml = await res.text();

  const parser = new XMLParser({ processEntities: false });
  const parsed = parser.parse(xml);

  const channel = parsed?.rss?.channel;
  if (!channel) {
    throw new Error("invalid RSS: missing channel");
  }

  const { title, link, description } = channel;
  if (
    typeof title !== "string" ||
    typeof link !== "string" ||
    typeof description !== "string"
  ) {
    throw new Error("invalid RSS: missing channel metadata");
  }

  const rawItems = channel.item;
  const itemsArr = Array.isArray(rawItems)
    ? rawItems
    : rawItems
      ? [rawItems]
      : [];

  const items: RSSItem[] = [];
  for (const it of itemsArr) {
    if (
      typeof it?.title === "string" &&
      typeof it?.link === "string" &&
      typeof it?.description === "string" &&
      typeof it?.pubDate === "string"
    ) {
      items.push({
        title: it.title,
        link: it.link,
        description: it.description,
        pubDate: it.pubDate,
      });
    }
  }

  return { channel: { title, link, description, item: items } };
}
