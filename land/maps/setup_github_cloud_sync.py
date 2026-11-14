"""One-time Google Drive OAuth2 setup for 24/7 GitHub Actions cloud Mouza map sync.

Guides you to authorize Google Drive access via loopback browser sign-in, creates
the `GDRIVE_OAUTH_JSON` secret in `salman-anik/Bangladesh-Biggest-Public-Database`,
and dispatches `.github/workflows/mouza-drive-sync.yml` so uploads continue even
when your PC is turned off.
"""

import argparse
import http.server
import json
import os
import shutil
import subprocess
import sys
import urllib.parse
import urllib.request
import webbrowser
from pathlib import Path

DEFAULT_REPO = "salman-anik/Bangladesh-Biggest-Public-Database"
SCOPE = "https://www.googleapis.com/auth/drive"
LOCAL_OAUTH_CACHE = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "BangladeshMouzaSync" / "cloud_oauth.json"


def get_gcloud_adc_path():
    cfg_dir = os.environ.get("CLOUDSDK_CONFIG")
    if cfg_dir:
        return Path(cfg_dir) / "application_default_credentials.json"
    if os.name == "nt":
        return Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming")) / "gcloud" / "application_default_credentials.json"
    return Path.home() / ".config" / "gcloud" / "application_default_credentials.json"


def run_gcloud_oauth():
    """Authorize Google Drive via installed `gcloud` CLI without creating a custom OAuth client."""
    gcloud_bin = shutil.which("gcloud")
    if not gcloud_bin:
        return None
    adc_path = get_gcloud_adc_path()
    print(f"Using `{gcloud_bin}` for 1-click Google Drive authorization (browser window will open)...")
    subprocess.run(
        [gcloud_bin, "auth", "login", "--enable-gdrive-access", "--update-adc", "--force", "--quiet"],
        check=True,
    )
    if not adc_path.exists():
        raise RuntimeError(f"Expected credentials file not found after gcloud login: {adc_path}")
    raw = json.loads(adc_path.read_text(encoding="utf-8"))
    if not (raw.get("client_id") and raw.get("client_secret") and raw.get("refresh_token")):
        raise RuntimeError(f"ADC file at {adc_path} is missing client_id/client_secret/refresh_token.")
    payload = {
        "client_id": raw["client_id"],
        "client_secret": raw["client_secret"],
        "refresh_token": raw["refresh_token"],
    }
    LOCAL_OAUTH_CACHE.parent.mkdir(parents=True, exist_ok=True)
    LOCAL_OAUTH_CACHE.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return payload


def find_downloaded_client_secret():
    dl_dir = Path.home() / "Downloads"
    if not dl_dir.exists():
        return None
    matches = sorted(dl_dir.glob("client_secret*.json"), key=lambda p: p.stat().st_mtime, reverse=True)
    return matches[0] if matches else None


def load_client_config(path_arg=None):
    cand = Path(path_arg) if path_arg else find_downloaded_client_secret()
    if cand and cand.exists():
        print(f"Found Google OAuth client file: {cand}")
        raw = json.loads(cand.read_text(encoding="utf-8"))
        if "installed" in raw:
            raw = raw["installed"]
        elif "web" in raw:
            raw = raw["web"]
        cid = raw.get("client_id", "").strip()
        csec = raw.get("client_secret", "").strip()
        if cid and csec:
            return cid, csec

    print("\n--- One-Time Google Drive OAuth Client Setup ---")
    print("1. Open: https://console.cloud.google.com/apis/library/drive.googleapis.com")
    print("   -> Make sure Google Drive API is ENABLED on your project.")
    print("2. Open: https://console.cloud.google.com/apis/credentials")
    print("   -> Click '+ CREATE CREDENTIALS' -> 'OAuth client ID'")
    print("   -> Application type: 'Desktop app' -> Create -> Download JSON (or copy Client ID & Secret).")
    print("   (If prompted on OAuth Consent Screen, add your Gmail under 'Test users'.)\n")

    path_input = input("Paste path to downloaded client_secret_*.json (or press Enter to paste Client ID manually): ").strip().strip('"')
    if path_input and Path(path_input).exists():
        return load_client_config(path_input)

    cid = input("Google OAuth Client ID: ").strip()
    csec = input("Google OAuth Client Secret: ").strip()
    if not cid or not csec:
        raise SystemExit("Client ID and Client Secret are required.")
    return cid, csec


def run_browser_oauth(client_id, client_secret):
    auth_result = {}

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            qs = urllib.parse.parse_qs(parsed.query)
            auth_result["code"] = (qs.get("code") or [None])[0]
            auth_result["error"] = (qs.get("error") or [None])[0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            if auth_result["code"]:
                msg = "<h2>Google Drive Authorized!</h2><p>You can close this browser tab and return to the terminal.</p>"
            else:
                msg = f"<h2>Authorization Failed</h2><p>{auth_result['error']}</p>"
            self.wfile.write(msg.encode("utf-8"))

        def log_message(self, format, *args):
            pass

    server = http.server.HTTPServer(("127.0.0.1", 0), Handler)
    port = server.server_address[1]
    redirect_uri = f"http://127.0.0.1:{port}/"

    params = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": SCOPE,
            "access_type": "offline",
            "prompt": "consent",
        }
    )
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{params}"
    print(f"\nOpening browser for Google Drive login:\n{auth_url}\n")
    webbrowser.open(auth_url)

    while "code" not in auth_result and "error" not in auth_result:
        server.handle_request()
    server.server_close()

    if not auth_result.get("code"):
        raise SystemExit(f"OAuth failed: {auth_result.get('error')}")

    body = urllib.parse.urlencode(
        {
            "code": auth_result["code"],
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        tok = json.loads(resp.read().decode("utf-8"))

    refresh_token = tok.get("refresh_token")
    if not refresh_token:
        raise SystemExit("Google did not return a refresh_token. Try revoking app access in your Google Account and retry.")

    payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
    }
    LOCAL_OAUTH_CACHE.parent.mkdir(parents=True, exist_ok=True)
    LOCAL_OAUTH_CACHE.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return payload


def main():
    parser = argparse.ArgumentParser(description="Configure GitHub Actions 24/7 Google Drive secret & trigger workflow.")
    parser.add_argument("--repo", default=DEFAULT_REPO)
    parser.add_argument("--credentials", default=None, help="Path to Google Desktop OAuth client_secret_*.json")
    parser.add_argument("--reuse-cached", action="store_true", help="Reuse cached cloud_oauth.json if present")
    args = parser.parse_args()

    payload = None
    if args.reuse_cached and LOCAL_OAUTH_CACHE.exists():
        payload = json.loads(LOCAL_OAUTH_CACHE.read_text(encoding="utf-8"))
        print(f"Reusing cached OAuth credentials from {LOCAL_OAUTH_CACHE}")
    elif not args.credentials and shutil.which("gcloud"):
        payload = run_gcloud_oauth()

    if payload is None:
        cid, csec = load_client_config(args.credentials)
        payload = run_browser_oauth(cid, csec)

    gh_bin = shutil.which("gh") or "gh"
    secret_json = json.dumps(payload)
    print(f"\nUploading GDRIVE_OAUTH_JSON secret to GitHub repo `{args.repo}`...")
    subprocess.run(
        [gh_bin, "secret", "set", "GDRIVE_OAUTH_JSON", "-R", args.repo],
        input=secret_json,
        text=True,
        check=True,
    )
    print("Secret saved! Starting 24/7 GitHub Actions workflow (`mouza-drive-sync.yml`)...")
    subprocess.run([gh_bin, "workflow", "run", "mouza-drive-sync.yml", "-R", args.repo], check=True)
    print("\nDone! GitHub Actions is now uploading Mouza maps to your Google Drive even when your PC is off.")
    print(f"Monitor runs at: https://github.com/{args.repo}/actions/workflows/mouza-drive-sync.yml")


if __name__ == "__main__":
    main()
