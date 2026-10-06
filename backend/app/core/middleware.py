import time
from typing import Dict, Tuple
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

# Simple in-memory IP Rate Limiter
RATE_LIMIT_STORE: Dict[str, Tuple[int, float]] = {}  # ip -> (count, window_start_time)
MAX_REQUESTS_PER_MINUTE = 1000
WINDOW_SECONDS = 60.0


class SecurityHeadersAndRateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()

        # 1. Rate Limiting Check
        if client_ip in RATE_LIMIT_STORE:
            count, start_time = RATE_LIMIT_STORE[client_ip]
            if now - start_time < WINDOW_SECONDS:
                if count >= MAX_REQUESTS_PER_MINUTE:
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Too many requests. Rate limit exceeded."},
                        headers={
                            "X-RateLimit-Limit": str(MAX_REQUESTS_PER_MINUTE),
                            "X-RateLimit-Remaining": "0",
                            "X-RateLimit-Reset": str(int(start_time + WINDOW_SECONDS))
                        }
                    )
                RATE_LIMIT_STORE[client_ip] = (count + 1, start_time)
            else:
                RATE_LIMIT_STORE[client_ip] = (1, now)
        else:
            RATE_LIMIT_STORE[client_ip] = (1, now)

        count, start_time = RATE_LIMIT_STORE[client_ip]
        remaining = max(0, MAX_REQUESTS_PER_MINUTE - count)
        reset_time = int(start_time + WINDOW_SECONDS)

        # 2. Process Request
        response = await call_next(request)

        # 3. Inject Security & Rate Limit Headers (OWASP Hardening)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
        response.headers["X-RateLimit-Limit"] = str(MAX_REQUESTS_PER_MINUTE)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_time)

        return response
