import socket
import ipaddress
from urllib.parse import urlparse
from typing import Dict, Optional
import httpx
from bs4 import BeautifulSoup

class ScraperService:
    def __init__(self, timeout_seconds: float = 6.0):
        self.timeout = timeout_seconds

    def _is_safe_url(self, url: str) -> bool:
        """
        SSRF Protection: Ensure the URL does not resolve to localhost,
        private RFC 1918 addresses, loopbacks, or metadata services.
        """
        try:
            parsed = urlparse(url)
            if parsed.scheme not in ("http", "https"):
                return False

            hostname = parsed.hostname
            if not hostname:
                return False

            # Block common cloud metadata and localhost names
            lower_host = hostname.lower()
            if lower_host in ("localhost", "127.0.0.1", "0.0.0.0", "metadata.google.internal"):
                return False

            # Resolve DNS
            addr_info = socket.getaddrinfo(hostname, None)
            for item in addr_info:
                ip_str = item[4][0]
                ip = ipaddress.ip_address(ip_str)
                if (
                    ip.is_private
                    or ip.is_loopback
                    or ip.is_link_local
                    or ip.is_reserved
                    or ip.is_multicast
                ):
                    return False

            return True
        except Exception:
            return False

    async def fetch_metadata(self, url: str) -> Dict[str, Optional[str]]:
        """
        Fetches webpage title, description, domain, and thumbnail.
        Gracefully falls back to domain-only if fetch fails or URL is blocked.
        """
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path.split("/")[0]
        result: Dict[str, Optional[str]] = {
            "url": url,
            "title": domain,
            "description": None,
            "domain": domain,
            "thumbnail_url": None,
        }

        if not self._is_safe_url(url):
            result["title"] = f"{domain} (Protected resource)"
            return result

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) IdeaBubbles/1.0",
            "Accept": "text/html,application/xhtml+xml",
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout, follow_redirects=True) as client:
                response = await client.get(url, headers=headers)
                if response.status_code >= 400:
                    return result

                html = response.text
                soup = BeautifulSoup(html, "html.parser")

                # Title
                title_tag = soup.find("title")
                og_title = soup.find("meta", property="og:title")
                if og_title and og_title.get("content"):
                    result["title"] = og_title["content"].strip()
                elif title_tag and title_tag.string:
                    result["title"] = title_tag.string.strip()

                # Description
                og_desc = soup.find("meta", property="og:description")
                meta_desc = soup.find("meta", attrs={"name": "description"})
                if og_desc and og_desc.get("content"):
                    result["description"] = og_desc["content"].strip()
                elif meta_desc and meta_desc.get("content"):
                    result["description"] = meta_desc["content"].strip()

                # Thumbnail
                og_image = soup.find("meta", property="og:image")
                if og_image and og_image.get("content"):
                    image_url = og_image["content"].strip()
                    if image_url.startswith("http"):
                        result["thumbnail_url"] = image_url

                # Truncate if excessively long
                if result["title"] and len(result["title"]) > 250:
                    result["title"] = result["title"][:247] + "..."
                if result["description"] and len(result["description"]) > 500:
                    result["description"] = result["description"][:497] + "..."

        except Exception:
            # On error, gracefully keep domain-level metadata
            pass

        return result

scraper_service = ScraperService()
