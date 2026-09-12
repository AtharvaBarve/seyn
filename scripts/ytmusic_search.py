#!/usr/bin/env python3
"""Search YouTube Music via ytmusicapi and print JSON results."""

import argparse
import json
import sys

from ytmusicapi import YTMusic


def get_artist_name(item):
    artists = item.get("artists") or []
    names = [artist.get("name") for artist in artists if artist.get("name")]
    if names:
        return ", ".join(names)
    return item.get("artist") or "Unknown artist"


def best_thumbnail(item):
    thumbnails = item.get("thumbnails") or []
    if not thumbnails:
        return item.get("thumbnail") or ""
    best = thumbnails[-1]
    return best.get("url") or ""


def main():
    parser = argparse.ArgumentParser(description="Search YouTube Music via ytmusicapi web requests.")
    parser.add_argument("query", nargs="+", help="Song title and artist to search for")
    args = parser.parse_args()

    query = " ".join(args.query)

    try:
        ytm = YTMusic()
        results = ytm.search(query, filter="songs", limit=25)
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        return 1

    items = []
    for item in results[:25]:
        video_id = item.get("videoId")
        title = item.get("title") or "Unknown title"
        artist = get_artist_name(item)

        items.append({
            "id": video_id,
            "videoId": video_id,
            "title": title,
            "artist": artist,
            "duration": item.get("duration") or "0:00",
            "thumbnail": best_thumbnail(item),
            "url": f"https://music.youtube.com/watch?v={video_id}" if video_id else "",
            "streamUrl": None,
            "lyrics": "",
        })

    print(json.dumps(items))
    return 0


if __name__ == "__main__":
    sys.exit(main())
