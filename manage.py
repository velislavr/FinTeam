#!/usr/bin/env python3
"""CLI for managing FinTeam API keys.

Usage:
    python manage.py create-key              # create with default limit
    python manage.py create-key --limit 20   # create with custom limit
    python manage.py list-keys               # show all keys
    python manage.py revoke-key ft-abc123    # delete a key
"""
import argparse
import sys

from app.config import settings
from app.utils.auth import create_key, list_keys, revoke_key


def cmd_create(args):
    limit = args.limit or settings.default_key_limit
    key = create_key(limit)
    print(f"{key}  (limit: {limit})")


def cmd_list(_args):
    keys = list_keys()
    if not keys:
        print("No keys found.")
        return
    print(f"{'KEY':<32} {'USED':>5} {'LIMIT':>6} {'REMAINING':>10}")
    print("-" * 60)
    for k in keys:
        print(f"{k['key']:<32} {k['used']:>5} {k['limit']:>6} {k['remaining']:>10}")


def cmd_revoke(args):
    if revoke_key(args.key):
        print(f"Revoked: {args.key}")
    else:
        print(f"Key not found: {args.key}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="FinTeam key management")
    sub = parser.add_subparsers(dest="command")

    create = sub.add_parser("create-key", help="Generate a new API key")
    create.add_argument("--limit", type=int, default=None, help="Max analyses (default from config)")

    sub.add_parser("list-keys", help="List all API keys")

    revoke = sub.add_parser("revoke-key", help="Revoke an API key")
    revoke.add_argument("key", help="The API key to revoke")

    args = parser.parse_args()
    if args.command is None:
        parser.print_help()
        sys.exit(1)

    commands = {
        "create-key": cmd_create,
        "list-keys": cmd_list,
        "revoke-key": cmd_revoke,
    }
    commands[args.command](args)


if __name__ == "__main__":
    main()
