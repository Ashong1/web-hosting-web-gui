#!/usr/bin/env python3
import os
import sys
import json
import argparse
import requests
import getpass
from pathlib import Path

CONFIG_PATH = Path.home() / ".asero" / "config.json"
DEFAULT_BASE_URL = "https://portal.aserotech.com/api/v1"

def save_config(api_key, base_url=None):
    CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    config = {"api_key": api_key}
    if base_url:
        config["base_url"] = base_url.rstrip("/")
    with open(CONFIG_PATH, "w") as f:
        json.dump(config, f)
    print("Configuration saved successfully.")

def load_config():
    if not CONFIG_PATH.exists():
        print("Error: No configuration found. Run 'asero auth' first.")
        sys.exit(1)
    with open(CONFIG_PATH, "r") as f:
        return json.load(f)

def get_base_url():
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r") as f:
                data = json.load(f)
                return data.get("base_url", DEFAULT_BASE_URL)
        except Exception:
            pass
    return DEFAULT_BASE_URL

def get_headers():
    config = load_config()
    return {
        "X-Asero-Key": config["api_key"],
        "Accept": "application/json"
    }

def list_nodes(output_json=False):
    response = requests.get(f"{get_base_url()}/nodes", headers=get_headers())
    if response.status_code == 200:
        data = response.json()
        if output_json:
            print(json.dumps(data, indent=2))
            return
        nodes = data["data"]
        print(f"{'ID':<5} {'NAME':<20} {'STATUS':<15} {'PLAN':<15}")
        print("-" * 55)
        for node in nodes:
            print(f"{node['id']:<5} {node['name']:<20} {node['status']:<15} {node['plan']:<15}")
    else:
        error_msg = response.json().get('error', 'Authentication failed')
        if output_json:
            print(json.dumps({"error": error_msg}))
        else:
            print(f"Error: {error_msg}")

def deploy_node(node_id, output_json=False):
    response = requests.post(f"{get_base_url()}/nodes/{node_id}/deploy", headers=get_headers())
    if response.status_code == 200:
        data = response.json()
        if output_json:
            print(json.dumps(data, indent=2))
        else:
            print(f"Success: {data['message']}")
    else:
        error_msg = response.json().get('error', 'Action failed')
        if output_json:
            print(json.dumps({"error": error_msg}))
        else:
            print(f"Error: {error_msg}")

def control_node(node_id, action, output_json=False):
    response = requests.post(f"{get_base_url()}/nodes/{node_id}/action/{action}", headers=get_headers())
    if response.status_code == 200:
        data = response.json()
        if output_json:
            print(json.dumps(data, indent=2))
        else:
            print(f"Success: {data['message']}")
    else:
        error_msg = response.json().get('error', 'Action failed')
        if output_json:
            print(json.dumps({"error": error_msg}))
        else:
            print(f"Error: {error_msg}")

def main():
    parser = argparse.ArgumentParser(description="AseroTech Cloud CLI")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    subparsers = parser.add_subparsers(dest="command")

    # Auth
    auth_parser = subparsers.add_parser("auth", help="Authenticate with your API key")
    auth_parser.add_argument("key", nargs="?", help="Your Asero API Key (optional, prompts securely if omitted)")
    auth_parser.add_argument("--url", help="Your custom Asero Portal API URL")

    # Nodes
    subparsers.add_parser("list", help="List all compute nodes")
    
    # Deploy
    deploy_parser = subparsers.add_parser("deploy", help="Trigger a node redeployment")
    deploy_parser.add_argument("id", help="The Node ID")

    # Control
    control_parser = subparsers.add_parser("node", help="Control a node (start/stop/restart)")
    control_parser.add_argument("action", choices=["start", "stop", "restart"], help="Action to perform")
    control_parser.add_argument("id", help="The Node ID")

    args = parser.parse_args()

    if args.command == "auth":
        key = args.key
        if not key:
            key = getpass.getpass("Enter your Asero API Key: ")
        save_config(key, args.url)
    elif args.command == "list":
        list_nodes(output_json=args.json)
    elif args.command == "deploy":
        deploy_node(args.id, output_json=args.json)
    elif args.command == "node":
        control_node(args.id, args.action, output_json=args.json)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
