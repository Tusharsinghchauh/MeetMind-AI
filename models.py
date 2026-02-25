from pydantic import BaseModel
from typing import List, Dict

class PriorityList(BaseModel):
    high: List[str]
    medium: List[str]
    low: List[str]

class MeetingAnalysis(BaseModel):
    summary: str
    important_points: List[str]
    priority_list: PriorityList