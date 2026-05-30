import datetime

from django.conf import settings
from livekit import api as livekit_api


def generate_livekit_token(identity: str, room: str, is_publisher: bool = False) -> str:
    token = livekit_api.AccessToken(
        api_key=settings.LIVEKIT_API_KEY,
        api_secret=settings.LIVEKIT_API_SECRET,
    )
    token.with_identity(identity)
    token.with_grants(
        livekit_api.VideoGrants(
            room_join=True,
            room=room,
            can_publish=is_publisher,
            can_subscribe=True,
        )
    )
    token.with_ttl(datetime.timedelta(hours=24))
    return token.to_jwt()


def get_livekit_url() -> str:
    return settings.LIVEKIT_URL
