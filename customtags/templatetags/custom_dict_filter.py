from django import template
from leave.models import Leave


register = template.Library()

@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)

@register.filter
def get_month_from_list(list, index):
    return list[index-1]

@register.filter
def get_holiday(date):
    return Leave.objects.filter(date=date)[0].name