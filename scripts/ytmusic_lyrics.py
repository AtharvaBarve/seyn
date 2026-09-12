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

        lyrics_data = ytm.get_lyrics(lyrics_id, timestamps=True)
        if not isinstance(lyrics_data, dict):
            print(json.dumps({"lyrics": ""}))
            return 0

        raw_lyrics = lyrics_data.get("lyrics") or ""
        if isinstance(raw_lyrics, list):
            lines = [
                {
                    "text": str(line.text or "").strip(),
                    "start": float(line.start_time or 0) / 1000,
                    "end": float(line.end_time or 0) / 1000,
                }
                for line in raw_lyrics
                if str(line.text or "").strip()
            ]
            print(json.dumps({"lyrics": "\n".join(line["text"] for line in lines), "lines": lines}))
        else:
            print(json.dumps({"lyrics": str(raw_lyrics).strip(), "lines": []}))
        return 0
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        return 1


if __name__ == "__main__":
    sys.exit(main())
