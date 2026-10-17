/**
 * A curated set of Instagram hashtags widely documented as banned, blocked
 * or restricted (posts under them get hidden from Explore / hashtag pages).
 * Instagram never publishes an official list and it shifts over time, so this
 * is a best-effort reference, not a guarantee — treat flags as "risky, avoid".
 * Stored lowercase, without the leading '#'.
 */
export const BANNED_HASHTAGS: ReadonlySet<string> = new Set([
  "adulting", "alone", "always", "armparty", "asia", "assworkout", "attractive",
  "babe", "beautyblogger", "bikinibody", "boho", "brain", "costumes", "curvy",
  "curvygirls", "date", "dating", "desk", "dm", "direct", "easter", "eggplant",
  "elevator", "fitnessgirls", "girlsonly", "goddess", "gloves", "hardworkpaysoff",
  "humpday", "ig", "instababy", "instasport", "italiano", "kansas", "kickoff",
  "killingit", "leaves", "likeback", "likeforlike", "lingerie", "loseweight",
  "lulu", "master", "milf", "mirrorphoto", "models", "mustfollow", "nasty",
  "newyearsday", "nude", "nudity", "petite", "pornfood", "prettygirl", "pushups",
  "ravebooty", "shower", "single", "skype", "snap", "snapchat", "snowstorm",
  "sopretty", "stranger", "streetphoto", "sunbathing", "swole", "tag4like",
  "tagsforlikes", "tanlines", "teens", "teen", "thick", "thighs", "thinspo",
  "thinspiration", "todayimwearing", "undies", "valentinesday", "wildlife",
  "woman", "workflow", "wtf", "youngmodel", "hotweather", "kissing", "beauty",
  "bikini", "boobs", "booty", "sexy", "sex", "gay", "lean", "hardsummer",
  "pushup", "petitegirl", "graffitiigers", "iphonegraphy", "instagram",
  "ass", "abdl", "besties", "brainstorm", "citycentre", "dogsofinstagram_",
  "girlsonlytrip", "happythanksgiving", "master1", "nudel", "pop", "single1",
  "snowflakes", "sunbath", "swingersparty", "tanline", "twerk", "underage",
  "workoutfromhome",
]);

/** Case-insensitive, '#'-agnostic membership test. */
export function isBannedHashtag(tag: string): boolean {
  return BANNED_HASHTAGS.has(tag.replace(/^#/, "").trim().toLowerCase());
}
