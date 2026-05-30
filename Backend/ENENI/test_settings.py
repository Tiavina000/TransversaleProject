from .settings import *

# Fake modeltranslation migrations to avoid Django 6 migration compat issue
MIGRATION_MODULES = {
    'modeltranslation': None,
}

# Fix modeltranslation compatibility with Django 6
# 1. MultilingualQuerySet._update now receives (values, returning_fields) but only accepts (values)
# 2. Must delegate to Django's QuerySet._update which handles returning_fields properly
import functools
from django.db.models.query import QuerySet
from modeltranslation.manager import MultilingualQuerySet

original_update = MultilingualQuerySet._update

@functools.wraps(original_update)
def patched_update(self, values, returning_fields=None):
    # Let Django's QuerySet._update handle returning_fields properly
    return QuerySet._update(self, values, returning_fields=returning_fields)

MultilingualQuerySet._update = patched_update
