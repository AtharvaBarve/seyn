#!/usr/bin/env python3
"""Fetch YouTube Music lyrics by video ID via ytmusicapi."""

import argparse
import json
import sys

from ytmusicapi import YTMusic


def main():
    parser = argparse.ArgumentParser(description="Fetch YouTube Music lyrics via ytmusicapi.")
    parser.add_argument("video_id", help="YouTube video id")
    args = parser.parse_args()

    try:
        ytm = YTMusic()
        watch_playlist = ytm.get_watch_playlist(args.video_id)
        lyrics_id = watch_playlist.get("lyrics")
        if not lyrics_id:
            print(json.dumps({"lyrics": ""}))
            return 0

        lyrics_data = ytm.get_lyrics(lyrics_id)
        if not isinstance(lyrics_data, dict):
            print(json.dumps({"lyrics": ""}))
            return 0

        print(json.dumps({"lyrics": (lyrics_data.get("lyrics") or "").strip()}))
        return 0
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        return 1


if __name__ == "__main__":
    sys.exit(main())
