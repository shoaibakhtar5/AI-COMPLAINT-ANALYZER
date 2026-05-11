from uuid import uuid4


def uuid_str() -> str:
    return str(uuid4())


def case_id() -> str:
    return f"CMP-{str(uuid4().int)[0:5]}"


def upload_id() -> str:
    return f"UP-{str(uuid4().int)[0:6]}"
